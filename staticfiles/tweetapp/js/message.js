let loadState = 0, maxState = 1;getting=false;
let pushedMessagesId =  {};
let csrf = Array.from(document.getElementsByName("csrfmiddlewaretoken"))[0];


function getMessages(latest){
  if (loadState   > maxState) return;
  if (getting){
    return;
  } else {
    getting = !getting;
  }
  let xhr = new XMLHttpRequest();
  if (latest){
    xhr.open('GET', `state=0/`, true);
  } else {
    xhr.open('GET', `state=${loadState}/`, true);
  }
  xhr.send();
  xhr.onload = function (){
    if (xhr.status ==  200){
      let data = JSON.parse(xhr.responseText);
      if (latest==true){
        pushMessages(data.messages, true);
        loadState = 1;
        maxState = data.maxState;
        getting =  !getting;  
        const scrollable = document.getElementById("container-main").scrollHeight - document.getElementById("container-main").parentElement.scrollHeight;
        document.getElementById("container-main").scrollTop = scrollable + 57;    
      } else {
        let container = document.getElementById("container-main");
        let prevTopChildId = container.children[0].children[0].id;
        pushMessages(data.messages); 
        document.getElementById(prevTopChildId).scrollIntoView(true);
        loadState++;
        maxState = data.maxState;
        getting =  !getting;
      }
    }
  };
}


function pushMessages(messages, bottom){
  let container = document.getElementById("container");
  messages.forEach(msg => {
    let html = `
      <div id="msg-${msg.id}" class="msg-left border p-2 align-self-end  my-2 mx-2">
        <div class="msg-head d-flex py-1 justify-content-between">
          <small class="text-capitalize font-weight-bold">${(msg.creator.name)}</small>
          <small class="text-muted">${msg.creator.username}</small>
        </div>
        <div class="msg-body">
          ${msg.message.content}
          {image}
        </div>
      </div>
    `;
    if (msg.message.image){
      html = html.replace("{image}", `<img src="${msg.message.image}" class="preview-image preview-imgage" />`);
    } else {
      html = html.replace("{image}", "");
    }
    if (!(msg.id in pushedMessagesId)){
      if (msg.creator.name === null){
        html = `
            <div id="msg-${msg.id}" class="msg-center bg-light text-center p-2 align-self-center">
              <span class="text-muted">${msg.message.content}</span>
            </div>
          `;
      }
      if (bottom){
        container.innerHTML += html;
      } else {
        container.innerHTML = html + container.innerHTML;
      }
      if (msg.creator.name !== "You" && msg.creator.name !== null){
        html = document.getElementById(`msg-${msg.id}`);
        html.classList.remove("align-self-end");
        html.classList.remove("msg-left");
        html.classList.add("mr-auto");
        html.classList.add("msg-right");      
      } 
      pushedMessagesId[msg.id] =  msg.id;
    }
  });
  imageEventListner();
}


function imageEventListner() {
  Array.from(document.getElementsByClassName("preview-image")).forEach(img => {
    img.addEventListener('click', pushImageFullView);
  });
}


function pushImageFullView(event){
  let modal = `
    <div id="image-modal" class="modal fade" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="img">
        <div class="modal-content">
          <div class="imageFullView" style="background-image: url('${event.target.src}');">
            <div class="close border text-center" data-dismiss="modal" aria-label="Close">
              &times;
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("Image-Modal").innerHTML = modal;
  $("#image-modal").modal("show");
}


function messageBody(sender){

}

function sendMessageAjax(url, body){
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);

  let form_data = new FormData();
  let textContent = body["text-content"];
  let mediaContent = body["media-content"];
  
  form_data.append("content", textContent);
  form_data.append("image", mediaContent);
  
  xhr.send(form_data);
  
  xhr.onload = function () {
    if (this.status==201){
      let data = JSON.parse(this.responseText);
      pushMessages([data.message], true);
    }
  };
}

