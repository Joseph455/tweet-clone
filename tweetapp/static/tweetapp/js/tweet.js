// This is the js script for individual tweet pages 

let loadState = 0, maxState = 1;
let pushedReplies =  [];
let getting = false;
let csrf = Array.from(document.getElementsByName("csrfmiddlewaretoken"))[0];



function deepEqual(object1, object2) {

  function remove(value, array) {
    let index = array.indexOf(value);
    if (index == -1) {
      return array;
    }
    return array.slice(0, index).concat(array.slice(index + 1));
  }

  // skip comparing the date of the threads
  let keys1 = remove("date", Object.keys(object1));
  let keys2 = remove("date", Object.keys(object2));
  keys1 = remove("likes", keys1);
  keys2 = remove("likes", keys2);
  keys1 = remove("retweets", keys1);
  keys2 = remove("retweets", keys2);
  keys1 = remove("replies", keys1);
  keys2 = remove("replies", keys2);
  keys1 = remove("likeState", keys1);
  keys2 = remove("likeState", keys2);
  keys1 = remove("retweetState", keys1);
  keys2 = remove("retweetState", keys2);
  keys1 = remove("replyState", keys1);
  keys2 = remove("replyState", keys2);


  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      areObjects && !deepEqual(val1, val2) ||
      !areObjects && val1 !== val2
    ) {
      return false;
    }
  }

  return true;
}

function isObject(object) {
  return object != null && typeof object === 'object';
}


function setTweetIconState() {
  icons = Array.from(document.getElementsByClassName("twt-icon"));
  let xhr = new  XMLHttpRequest();
  xhr.open("GET", window.location.href+"get-icon-state/", true);
  xhr.send();
  xhr.onload = function (){
    if (this.status == 200){
      let data = JSON.parse(this.responseText);
      icons.forEach(icon => {
        icon.attributes.state.nodeValue =  data[icon.attributes.name.nodeValue];
        styleIconByState();
      });
    }
  };
}


function getReplies(){
  if (loadState >= maxState) return;
  if (!getting){
    getting = true;
  } else {
    return;
  }
  let url = `${window.location.pathname}${loadState}`;
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.send();
  xhr.onload = function (){
    if (this.status == 200){
      let data = JSON.parse(this.responseText);
      pushReplies(data.replies);
      loadState++;  
      maxState = Number(data.maxState);
      getting = false;
    } else {
      console.log("An error occured ");
    }
  };
}


function pushReplies(replies, top){
  for (let reply of replies){
    let isPushed = false;
    reply.date = new Date(reply.date);
    for (let t of pushedReplies) {
      if (deepEqual(t, reply)) {
        isPushed = true;
        break;
      }
    }
    if (isPushed) continue;
    pushedReplies.push(reply);
    let replyCard = constructReplyHtml(reply);
    if (top){
      document.getElementById("reply-container").innerHTML = replyCard + document.getElementById("reply-container").innerHTML;
    } else {
      document.getElementById("reply-container").innerHTML += replyCard;
    }
    styleIconByState();
  }
}

function dateToString(date) {
  let now = new Date();
  if (date.toDateString() == now.toDateString()){
    return date.toLocaleTimeString();
  } else {
    return date.toLocaleDateString();
  }
}

function constructReplyHtml(reply){
  
  let replyHTML = `
    <div class="card mb-2" onclick="changeUrlOnClick(event, '${reply.absolute_url}')"> 
      <div class="card-body">
        <div class="row no-gutters">
          <div class="col-3 col-md-2">
            <a href="${reply.creator.profileLink}" ><img src="${reply.creator.profilePicture}" alt="icon" class="card-img rounded-circle" style="width: 3rem; height: 3rem;" /></a>
          </div>
          <div class="col-9 col-md-10">
            <a href="${reply.creator.profileLink}">
              <span class="font-weight-bold">${reply.creator.name} <small class="text-muted">${reply.creator.username} ${dateToString(reply.date)}</small></span>
            </a>
            <div class="my-2">
              <span class="lead">{msg}</span>
              {img}
            </div>
            <div class="d-flex flex-row justify-content-between align-items-center mt-2">
              <span id="reply-icon-${reply.id}" state="${reply.replyState}" class="icon" name="reply-icon" onclick="pushReplyModal(event, ${reply.id}, null, '${reply.creator.profileLink}', '${reply.creator.username}', '${reply.creator.profilePicture}')">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chat base" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                </svg> ${reply.replies}
              </span>
              <span id="retweet-icon-${reply.id}" state="${reply.retweetState}" class="icon" name="retweet-icon" onclick="cancelBubbleOnClick(event)">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-repeat" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                </svg> ${reply.retweets}
              </span>
              <span id="like-icon-${reply.id}" state="${reply.likeState}" class="icon" name="like-icon" onclick="likeIconClickEvent(event, ${reply.id})">
                <svg width="1em" height="1em"  viewBox="0 0 16 16" class="bi bi-heart" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                </svg> ${reply.likes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div> 
  `;
  if (reply.message !== null){
    if (reply.message.content !== "" ){
      replyHTML = replyHTML.replace("{msg}", `<p>${reply.message.content}</p>`);
    } else {
      replyHtml = replyHTML.replace('{msg}', ``);      
    }
    if (reply.message.media !==null){
      let imgTag = `<img src="${reply.message.media}" name="previw-image" class="card-img rounded preview-imgage" onclick="imageShowFullview(event, ${reply.id})">`;
      replyHTML = replyHTML.replace('{img}', imgTag);      
    } else {
      replyHTML = replyHTML.replace('{img}', "");            
    }
  }
  return replyHTML;
}


function imageShowFullview(event, id){
  event.cancelBubble = true;
  id = (!id) ? "00": id;
  let modal = `
    <div id="image-modal-${id}" class="modal fade" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
  document.getElementById("image-modal").innerHTML = modal;
  $(`#image-modal-${id}`).modal('show');
}


function changeUrlOnClick(event, url){
  event.cancelBubble = true;
  window.location.href = url;
}


function styleIconByState(icon){
  let fillColor = {
    "reply-icon": "green",
    "retweet-icon": "blue",
    "like-icon": "red",
  };
  if (icon) {
    if (icon.attributes.state.nodeValue == "true"){
      icon.children[0].attributes.fill.nodeValue =  fillColor[icon.attributes.name.nodeValue];     
    } else {
      icon.children[0].attributes.fill.nodeValue = "black";
    }
    return;
  }
  let icons = Array.from(document.getElementsByClassName("icon"));
  icons.forEach(icon => {
    if (icon.attributes.state.nodeValue==="true"){
      icon.children[0].attributes.fill.nodeValue =  fillColor[icon.attributes.name.nodeValue];
    } else {
      icon.children[0].attributes.fill.nodeValue = "black";
    }
  });
}



function likeIconClickEvent(event, id, url){
  event.cancelBubble = true;
  let icon = event.target;
  if (icon.tagName=='svg'){
    icon = icon.parentElement;
  }
  if (icon.tagName=='path'){
    icon = icon.parentElement.parentElement;
  }
  if (!url){
    url = document.getElementById("id_like_url").attributes.value.nodeValue;
  }
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);
  let body = JSON.stringify({ "id": id});
  xhr.send(body);
  xhr.onload = function () {
    if (this.status === 201) {
      let data = JSON.parse(this.responseText);
      pushedReplies.push(data.thread);
      if (icon.attributes.state.nodeValue == "true") {
          let iconSVG = icon.children[0];
          if (icon.innerText != ""){
            let iconValue = Number(icon.innerText);
            iconValue--;
            if (iconValue < 1) iconValue = 0;
            icon.innerHTML = "";
            icon.append(iconSVG, " ", iconValue); 
          } else {
            let twtIconValue = /\d+/.exec(document.getElementById("id_tweet-likes").innerText)[0];
            twtIconValue = Number(twtIconValue) - 1;
            document.getElementById("id_tweet-likes").innerHTML = `${twtIconValue} ${document.getElementById("id_tweet-likes").children[0].outerHTML}`;
          }
          icon.attributes.state.nodeValue = "false";
          styleIconByState(icon);
      } else {
          let iconSVG = icon.children[0];
          if (icon.innerText != ""){
            let iconValue = Number(icon.innerText);
            iconValue++;
            icon.innerHTML = "";
            icon.append(iconSVG, " ", iconValue);
          } else {
            let twtIconValue = /\d+/.exec(document.getElementById("id_tweet-likes").innerText)[0];
            twtIconValue = Number(twtIconValue) + 1;
            document.getElementById("id_tweet-likes").innerHTML = `${twtIconValue} ${document.getElementById("id_tweet-likes").children[0].outerHTML}`;
          }
          icon.attributes.state.nodeValue = "true";
          styleIconByState(icon);
        }
    }
  };
}


function pushReplyModal(event, id, url , profile_link, username, profilePicture) {
  event.cancelBubble = true;
  let modal = `
    <div class="modal fade" id="reply-modal-${id}" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="false" >
      <div class="modal-lg modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content border-0 container">
          <div class="d-flex flex-row justify-content-between align-items-center p-1 border-bottom">
            <button type="button" class="close p-3" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <button id="" class="btn btn-primary">
            </button>
          </div>
          <div class="modal-body p-0 bg-transparent" style="max-height:80vh;">
            <div class="card-body">
              <div class="row no-gutters mt-2">
                <div class="col-2">
                  <img class="rounded-circle" src="${profilePicture}" style="width: 3rem; height: 3rem;"/>
                </div>
                <div class="col-10" style="width: 100%;">
                  <small class="text-muted">Replying <a class="text-primary" href="${profile_link}">${username}</a></small>
                  <textarea id="id_reply-text-content" maxlength="400" class="form-control mb-2" style="width: 100%;height:25vh;" placeholder="Write a reply..."></textarea>
                </div>
                <div class="col-12">
                  <div id="preview-container" class="card-body m-1 p-1 col-12 text-center">
                  
                  </div>
                  <div class="d-flex flex-row justify-content-between align-items-center border-top border-bottom py-3">    
                    <input type="file" accept="image/*" id="id_reply-media-content" hidden>
                    <label for="id_reply-media-content" style="color: rgba(29, 161, 242, 100);">
                      <svg width="2em" height="2em" viewBox="0 0 17 16" class="bi bi-image-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094L15.002 9.5V13a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1v-1zm5-6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      </svg>
                    </label>
                    <button id="id_submit_reply" class="btn btn-primary">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("ReplyModals").innerHTML = modal;
  document.getElementById("id_submit_reply").addEventListener("click",  function(event){
    event.preventDefault();
    let textField = document.getElementById("id_reply-text-content");
    if (textField.value !== ""){
      if (!url){
        url = document.getElementById("id_reply_url").value;
      }
      let icon = document.getElementById(`reply-icon-${id}`);
      let body = {
        "text-content": document.getElementById("id_reply-text-content").value,
        "media-content": document.getElementById("id_reply-media-content"),
      };
      $(`#reply-modal-${id}`).modal("hide");
      
      if (!id) {
        icon = document.getElementById("twt-reply-icon");
        id = document.getElementById("tweet_id").value;
      }
      sendCommentAjax(url, id, icon, body);
    }
  });
  document.getElementById("id_reply-media-content").addEventListener("change", function(event){
    document.getElementById("preview-container").innerHTML = "";  
    if (/^(image)[/](\w+)$/i.test(event.target.files[0].type)){
      let image = document.createElement("IMG");
      image.id = `id_reply-img-preview`;
      image.setAttribute("style", "width: 70%; height: 10rem;border-radius: 5%;");
      image.src = URL.createObjectURL(event.target.files[0]);
      image.className = "my-1";
      document.getElementById("preview-container").appendChild(image);
    }
  });
  $(`#reply-modal-${id}`).modal("show");
}




function pushRetweetFormModal(event, id, url, profilePicture){ 
  event.cancelBubble = true;
  let modal = `
    <div class="modal fade" id="retweet-form-modal-${id}" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="false" >
      <div class="modal-lg modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content border-0 container">
          <div class="d-flex flex-row justify-content-between align-items-center p-1 border-bottom">
            <button type="button" class="close p-3" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <button id="" class="btn btn-primary">
            </button>
          </div>
          <div class="modal-body p-0 bg-transparent" style="max-height:80vh;">
            <div class="card-body">
              <div class="row no-gutters mt-2">
                <div class="col-2">
                  <img class="rounded-circle" src="${profilePicture}" style="max-width: 3rem; max-height: 3rem;"/>
                </div>
                <div class="col-10" id="id_replyTweet" style="width: 100%;">
                  <textarea id="id_retweet-text-content" maxlength="400" class="form-control mb-2" style="width: 100%;height:25vh;" placeholder="Write a comment..."></textarea>
                </div>
                <div class="col-12">
                  <div id="retweet_preview-container" class="card-body m-1 p-1 text-center col-12">
                  
                  </div>
                  <div class="d-flex flex-row justify-content-between align-items-center border-top border-bottom py-3">    
                    <input type="file" accept="image/*" id="id_retweet-media-content" hidden>
                    <label for="id_retweet-media-content" style="color: rgba(29, 161, 242, 100);">
                      <svg width="2em" height="2em" viewBox="0 0 17 16" class="bi bi-image-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094L15.002 9.5V13a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1v-1zm5-6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      </svg>
                    </label>
                    <button id="id_submit_retweet" class="btn btn-primary">Retweet</button>
                  </div>
                </div>
              </div>
            </div>
          </div>  
        </div>
      </div>
    </div>
  `;
  document.getElementById("RetweetModals").innerHTML = modal;
  
  document.getElementById("id_submit_retweet").addEventListener("click", function(event){
    event.preventDefault();
    let textField = document.getElementById("id_retweet-text-content");
    if (textField.value !== ""){
      let icon = document.getElementById(`retweet-icon-${id}`);
      let body = {
        "text-content": document.getElementById("id_retweet-text-content"),
        "media-content": document.getElementById("id_retweet-media-content"),
      };
      
      $(`#retweet-form-modal-${id}`).modal("hide");
      
      if (!id) {
        icon = document.getElementById("twt-retweet-icon");
        id = document.getElementById("tweet_id").value;
      }
      
      sendCommentAjax(url, id, icon, body);
    }
  });
  $(`#retweet-form-modal-${id}`).modal("show");

  document.getElementById("id_retweet-media-content").addEventListener("change", function(event){
    document.getElementById("retweet_preview-container").innerHTML = "";  
    if (/^(image)[/](\w+)$/i.test(event.target.files[0].type)){
      let image = document.createElement("IMG");
      image.id = `id_retweet-img-preview`;
      image.setAttribute("style", "width: 70%; height: 10rem;border-radius: 5%;");
      image.src = URL.createObjectURL(event.target.files[0]);
      image.className = "my-1";
      document.getElementById("retweet_preview-container").appendChild(image);
    }
  });

}




function sendCommentAjax(url, comment_id, icon, body){
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);
  

  let form_data = new FormData();
  let textContent = body["text-content"];
  let mediaContent = body["media-content"];
  form_data.append("comment_id", comment_id);
  if (textContent){
    form_data.append("content", textContent);
  }
  if (mediaContent){
    form_data.append("image", mediaContent.files[0]);
  }
  
  xhr.send(form_data);
  
  xhr.onload = function () {
    if (this.status==201){
      let data = JSON.parse(this.responseText);
      if (icon === null) return;
      if (icon.innerText != "") {
        // for icons of repies
        let iconSVG = icon.children[0];
        let iconValue = Number(icon.innerText);
        iconValue++;
        icon.innerHTML = "";
        icon.append(iconSVG, " ", iconValue);
        icon.attributes.state.nodeValue = "true";
        styleIconByState(icon);
      } else {
        // for page main icons 
        if (icon.attributes.name.nodeValue == "reply-icon") {
          let twtIconValue = /\d+/.exec(document.getElementById("id_tweet-replies").innerText)[0];
          twtIconValue = Number(twtIconValue) + 1;
          document.getElementById("id_tweet-replies").innerHTML = `${twtIconValue} ${document.getElementById("id_tweet-replies").children[0].outerHTML}`;
          pushReplies([data.thread], true);
        } else if (icon.attributes.name.nodeValue == "retweet-icon") {
          let twtIconValue = /\d+/.exec(document.getElementById("id_tweet-retweets").innerText)[0];
          twtIconValue = Number(twtIconValue) + 1;
          document.getElementById("id_tweet-retweets").innerHTML = `${twtIconValue} ${document.getElementById("id_tweet-retweets").children[0].outerHTML}`;
        }
        icon.attributes.state.nodeValue = "true";
        styleIconByState(icon);
      }
    } else {
      prompt(`${this.statusText}, ${this.responseText}`);
    }
  };
}


function cancelBubbleOnClick(event){
  event.cancelBubble = true;
}
