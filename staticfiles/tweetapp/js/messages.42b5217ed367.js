
let loadState=0, maxState=1, getting=false;
let csrf = Array.from(document.getElementsByName("csrfmiddlewaretoken"))[0];
let selectedProfiles = [];
let pushedConvId = {};


function searchAjax(container_id, value) {
  if (!value) return;
  let xhr = new XMLHttpRequest();
  let url = document.getElementById("id_find-profile-url").value;
  xhr.open('GET', url.slice(0, url.length-2)+`${value}/`, true);
  xhr.send();
  xhr.onload = function (){
    if (xhr.status == 200){
      let data = JSON.parse(xhr.responseText);
      if (data.results.length !== 0){
        pushProfiles(data.results, container_id, "search-result");
      } else {
        document.getElementById(container_id).innerHTML = "";
      }
    }
  };
}


function pushProfiles(results, container_id, type){
  let container = document.getElementById(container_id);
  container.innerHTML = "";
  for (let i=0; i<results.length; i++){
    let profile = results[i];
    let profileHtml =  `
      <div id="id_profile-${profile.id}-${type||""}" class="card border mb-1 rounded  p-2" > 
        <div class="card-body p-0">
          <div class="row no-gutters p-0">
            <div class="col-2 col-md-1 p-0">
              <img src="${profile.profilePicture}" alt="icon" class="card-img rounded-circle" style="width: 2rem; height: 2rem;" />
            </div>
            <div class="col-10 col-md-11">
              <div class="">
                ${profile.name}<br>
                ${profile.username} {follow-state}
              </div>
            </div>
          </div>
        </div>
      </div>`;
    if (profile.following && profile.follower){
      profileHtml = profileHtml.replace(
        "{follow-state}",
        `<small class="bg-white mx-2 text-muted">You follow each other</small><br>`);
    } else if (profile.follower){
      profileHtml = profileHtml.replace(
        "{follow-state}",
        `<small class="bg-white mx-2 text-muted">Follows you</small><br>`);
    } else if (profile.following){
      profileHtml = profileHtml.replace(
        "{follow-state}",
        `<small class="bg-white text-muted">You follow</small><br>`);
    } else {
      profileHtml = profileHtml.replace("{follow-state}","");
    }
    container.innerHTML += profileHtml;
    $(`#${container_id}`).dropdown('show');
  }

  results.forEach(profile => {
    document.getElementById(`id_profile-${profile.id}-${type||""}`).addEventListener("click", function(event){
      event.cancelBubble = true;
      addProfileToSelected(event, profile, this);
    });
  });
}


function getRelatedProfiles(url, container_id){
  let xhr =  new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.send();
  xhr.onload = function(){
    let response = JSON.parse(xhr.responseText);
    if (xhr.status ==200){
      pushProfiles(response.profiles, container_id, "related");
    }
  };
}


function remove(value, array) {
  let index = array.indexOf(value);
  if (index == -1) {
    return array;
  }
  return array.slice(0, index).concat(array.slice(index + 1));
}


function addProfileToSelected(event, profile, card){
  event.cancelBubble = true;
  if (selectedProfiles.find( e => {if (deepEqual(e, profile)) return true; })){
    card.classList.remove("active");
    selectedProfiles = remove(profile, selectedProfiles);
  } else {
    card.classList.add("active");
    selectedProfiles.push(profile);
  }
  renderSelectedProfiles();
}


function deepEqual(object1, object2) {

  let keys1 = Object.keys(object1);
  let keys2 = Object.keys(object2);

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



function renderSelectedProfiles(){
  let container = document.getElementById("id_selected-profiles");
  let btn = document.getElementById("id_start-btn");
  container.innerHTML = "";
  if (selectedProfiles.length==0){
    btn.disabled = true;
    container.parentElement.classList.add("d-none");
  } else {
    btn.disabled = false;
    selectedProfiles.forEach(profile => {
      let html = `
        <span class="d-flex mx-1 flex-fill bd-highlight text-muted">
          ${profile.username}
          <button id="id_remove-profile-${profile.id}" type="button" class="close mx-1" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </span>
      `;
      container.innerHTML += html;
      container.parentElement.classList.remove("d-none");
      document.getElementById(`id_remove-profile-${profile.id}`).addEventListener('click', function(event){
        event.cancelBubble = true;
        selectedProfiles = remove(profile, selectedProfiles);
        renderSelectedProfiles();
      });
    });
  }
}


function createConversationAjax(){
  // let url = document.getElementById("id_start-conversation").value;
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "", true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);
  let profileIds = [];
  selectedProfiles.forEach(profile => {
    profileIds.push(profile.id);
  });
  xhr.send(JSON.stringify({"profile_ids": profileIds}));
  xhr.onload = function (){
    if (xhr.status == 201){
      let data = JSON.parse(xhr.responseText);
      window.location.href = data.redirect;
    }
  };
}


function changeUrlOnClick(event, url){
  event.cancelBubble = true;
  window.location.href = url;
}

function dateToString(date) {
  let now = new Date();
  if (date.toDateString() == now.toDateString()){
    return date.toLocaleTimeString();
  } else {
    return date.toLocaleDateString();
  }
}

function getDataAjax(url, dataType){
  if (loadState > maxState) return;
  if (getting){
    return;
  } else {
    getting = !getting;
  }
  
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url.slice(0, url.length-1)+loadState, true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);
  xhr.send();
  xhr.onload = function (){
    if (xhr.status==200){
      let responseData = JSON.parse(xhr.responseText);
      if (dataType=="Invite"){
        if (responseData.invites.length > 0){
          pushInvites(responseData.invites);
        } else if (loadState == 0){
          document.getElementById("container").innerHTML = `
          <h4 class="text-center mx-5 mt-5"> Send a message, get a message </h4>
          <p class="text-center text-muted">Direct Messages are private conversations between you and any other person on TweetClone</p>
        `;
        }
      } else if (dataType=="Conversation") {
        if (responseData.conversations.length>0){
          pushConversations(responseData.conversations);
          console.log(loadState, maxState);
        } else if (loadState == 0) {
          document.getElementById("container").innerHTML = `
            <h4 class="text-center mx-5 mt-5"> Send a message, get a message </h4>
            <p class="text-center text-muted">Direct Messages are private conversations between you and any other person on TweetClone</p>
          `;
        }
      }
      loadState++;
      maxState = responseData.maxState;
      getting = !getting;
    }
  };
}


function pushConversations(conversations){
  let container =  document.getElementById("container");
  // construct htmlCard forEach conversation
  conversations.forEach(conv => {
    conv.date = new Date(conv.date);
    let html = `
      <div id="id_conv-${conv.id}" class="card p-3 my-2">
        ${conv.title||""}
        <div class="media">
          {conv-inner}
        </div>
        <small class="text-muted bd-highlight">Members: {conv-detail}</small>
      </div>
    `;
    let inner, detail; 
    if (conv.latestMessage) {
      let msg = conv.latestMessage;
      msg.date = new Date(msg.date);
      inner = `
        <img src="${msg.creator.profilePicture}" class="card-img rounded-circle mr-2" alt="..." style="width:3rem;height:3rem;" />
        <div class="media-body d-flex justify-content-between">
          <span>
            <h5>${msg.creator.name}</h5>
            <span class="text-muted">
              ${msg.message.content||'Sent a new message'}
            </span>
            <span class="text-muted">${dateToString(msg.date)}</span>
          </span>
        </div>
      `;
      if (conv.latestMessage.creator.name == null){
        inner = `
          <div class="media-body d-flex justify-content-between">
            <span>
              <span class="text-muted">
                ${msg.message.content}
              </span>
              <span class="text-muted">${dateToString(msg.date)}</span>
            </span>
          </div>
        `;
      }
    } else {
      inner = `
        <img src="${conv.loggedProfile.profilePicture}" class="card-img rounded-circle mr-2" alt="..." style="width:3rem;height:3rem;" />
        <div class="media-body text-muted ">
          <span class="d-flex w-100 justify-content-between">New conversation <small>${dateToString(conv.date)}</small></span>
          <small>No messages has been sent on this conversation</small>
        </div>
      `;
    }
    if (conv.members.length > 1){
      detail = `
        You and ${conv.members.length} others
      `;
    } else if (conv.members.length ==1) {
      detail = `
        You and ${conv.members[0].name} 
      `;
    } else {
      detail = `
       Just You.
      `;
    }
    html = html.replace("{conv-inner}", inner);
    html = html.replace("{conv-detail}", detail);
    container.innerHTML += html;
    pushedConvId[`${conv.id}`] = conv.id;
  });

  // add click eventlistner for eacch conversation html Card
  conversations.forEach(conv => {
    console.log(conv.id);
    document.getElementById(`id_conv-${conv.id}`).addEventListener('click', (event)=>{
      event.cancelBubble = true;
      window.location.href = conv.link;
    });
  });
}


function pushInvites(invites){
  let container =  document.getElementById("container");
  // construct invite html card for each invite
  invites.forEach(invite =>{
    invite.date = dateToString(invite.date);
    let html = `
      <div id="id_invite-${invite.id}" class="card p-3 my-2">
        <div class="media">
          <img src="${invite.creator.profilePicture}" class="card-img rounded-circle mr-2" alt="..." style="width:3rem;height:3rem;" />
          <div class="media-body">
            <span class="d-flex justify-content-between w-100">
              <span class="text-capitalize">${invite.creator.name} <small>${invite.creator.username}</small></span>
              <small>${invite.date}</small>
            </span>
            <p> Invited you to join a conversation</p>
            <small class="text-muted bg-highlight">Members: {conv-detail}</small><br>
            <span class="d-flex justify-content-between w-100 font-weight-bold">
              <button id="btn-join-${invite.id}" class="btn btn-sm badge-pill btn-outline-primary">Join</button>
              <button id="btn-reject-${invite.id}" class="btn btn-sm badge-pill btn-outline-danger">Reject</button>
            </span>
          </div>
        </div>
      </div>
    `;
    let detail;
    if (invite.conversation.members.length > 1){
      detail = `${invite.creator.name} and ${invite.conversation.members.length} others.`;
    } else {
      detail = `Just ${invite.creator.name}.`;
    }
    html = html.replace("{conv-detail}", detail);
    container.innerHTML += html;
  });

  // Add eventlistner for each invite html Card 
  invites.forEach(invite =>{
    // click event to accept invitaion
    document.getElementById(`btn-join-${invite.id}`).addEventListener('click', function(){
      event.cancelBubble = true;
      let url = document.getElementById("id_accept-invite-url").value;
      replyInviteAjax(invite.id, url);
    });
    // click event to reject invitaion
    document.getElementById(`btn-reject-${invite.id}`).addEventListener('click', function(){
      event.cancelBubble = true;
      let url = document.getElementById("id_reject-invite-url").value;
      replyInviteAjax(invite.id, url);
    });
  });
}


function replyInviteAjax(id, url){
  let xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);
  let body = {"id": id};
  xhr.send(JSON.stringify(body));
  xhr.onload = function (){
    if (xhr.status == 201){
      let responseData = JSON.parse(xhr.responseText);
      if (responseData.redirect){
        window.location.href = responseData.redirect;
      } else if (responseData.message){
        document.getElementById(`id_invite-${id}`).remove();
        alert(responseData.message);
        let inviteNav = document.getElementById("id_invite-nav").children[0];
        inviteNav.innerHTML = Number(inviteNav.innerHTML) -1;
      }
    }
  };
}
