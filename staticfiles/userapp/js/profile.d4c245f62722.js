
// global variables 
let maxState = 0, loadState = 0;
let pushedThreads = [];
let getting = false;
let csrf = Array.from(document.getElementsByName("csrfmiddlewaretoken"))[0];


function dateToString(date) {
  let now = new Date();
  if (date.toDateString() == now.toDateString()){
    return date.toLocaleTimeString();
  } else {
    return date.toLocaleDateString();
  }
}

function loadImageToLabel(event){
  event.cancelBubble = true;
  let file = event.target.files[0];
  if (/^(image)[/](\w+)$/i.test(file.type)){
    let label = Array.from(document.getElementsByTagName("label")).filter(label =>{
      if (label.htmlFor == event.target.id) return label;
    })[0];
    let style =  `
      background-image: url("${URL.createObjectURL(file)}");
    `;
    label.style = style;
  } else {
    event.target.files = null;
  }
}

function saveProfile(){
  let body = {};
  body.image = document.getElementById("id_profile-form-img").files[0];
  body.cover = document.getElementById("id_profile-form-cover").files[0];
  let name = document.getElementById("id_profile-form-name").value.trim().split(/\s/);
  body.firstName = name[0] || "";
  body.lastName = name[1] || "";
  body.bio =  document.getElementById("id_profile-form-bio").value;
  body.location =  document.getElementById("id_profile-form-location").value;
  body.website =  document.getElementById("id_profile-form-website").value;
  body.birthDate = document.getElementById("id_profile-form-birth-date").value;
  submitProfileEditAjax(body);
}


function submitProfileEditAjax(body){
  let url = document.getElementById("id_edit-profile-url").value;
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);
  let formData = new FormData();
  formData.append("image", body.image);
  formData.append("cover", body.cover);
  formData.append("first_name", body.firstName);
  formData.append("last_name", body.lastName);  
  formData.append("bio", body.bio);
  formData.append("location", body.location);
  formData.append("website", body.website);
  formData.append("date_of_birth", body.birthDate);
  xhr.send(formData);
  xhr.onload = function (){
    if (xhr.status==201){
      $("#edit-profile-modal").modal("hide");
      window.location.reload();
    } else if (xhr.status==404){
      let container = document.getElementById("profile-message-container");
      let errors = JSON.parse(xhr.responseText).errors;
      if (errors){
        errors.forEach(error =>{
          let errorHtml =  `
            <div class="alert alert-dismissible alert-danger fade show" role="alert">
              ${error}
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          `;
        });
      }
    }
  };
}


function loadTweets(url) {
  if (loadState > maxState) return;
  if (getting){
    return;
  } else {
    getting = !getting;
  }
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url.slice(0, url.length-2)+`${loadState}`, true);
  xhr.send();

  xhr.onload = function(){
    if (this.status == 200){
      let data = JSON.parse(this.responseText);
      if (data.tweets.length==0 && loadState==0){
        let noTweets  = `
          <h4 class="text-center mx-5 mt-5"> You haven't Tweeted anything yet</h4>
          <p class="text-center text-muted">When you send a Tweets it will show up here </p>
        `; 
        document.getElementById("threads").innerHTML = noTweets;
        loadState += 1;
        getting = !getting;
      } else {
        pushedThreads =  [];
        renderThreads(data.tweets);
        getting = !getting;
        loadState += 1;
        maxState =  data.maxState;
      }
    }
  };
}


function loadReplies(url){
  if (loadState > maxState) return;
  if (getting){
    return;
  } else {
    getting = !getting;
  }
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url.slice(0, url.length-2)+`${loadState}`, true);
  xhr.send();

  xhr.onload = function(){
    if (this.status == 200){
      let data = JSON.parse(this.responseText);
      if (data.replies.length==0 && loadState==0){
        let noReplies = `
          <h4 class="text-center mx-5 mt-5"> You haven't replied to any Threads yet</h4>
          <p class="text-center text-muted">When you reply a Thread it will show up here </p>
        `; 
        document.getElementById("threads").innerHTML = noReplies;
        loadState += 1;
        getting = !getting;
      } else {
        pushReplies(data.replies);
        getting = !getting;
        loadState += 1;
        maxState = data.maxState;
      }
    }
  };
}


function loadLikes(url){
  if (loadState > maxState) return;
  if (getting){
    return;
  } else {
    getting = !getting;
  }
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url.slice(0, url.length-2)+`${loadState}`, true);
  xhr.send();

  xhr.onload = function(){
    if (this.status == 200){
      let data = JSON.parse(this.responseText);
      if (data.likes.length==0 && loadState==0){
        let noLikes = `
          <h4 class="text-center mx-5 mt-5"> You haven't liked to any Threads yet</h4>
          <p class="text-center text-muted">When you like a Thread it will show up here </p>
        `;
        document.getElementById("threads").innerHTML = noLikes;
        loadState += 1;
        getting = !getting;
      } else {
        renderLikes(data.likes);
        styleIconByState();
        getting = !getting;
        loadState += 1;
        maxState =  data.maxState;
      }
    }
  };
}


function loadMedias(url){
  if (loadState > maxState) return;
  if (getting){
    return;
  } else {
    getting = !getting;
  }
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url.slice(0, url.length-2)+`${loadState}`, true);
  xhr.send();
  xhr.onload = function(){
    if (xhr.status==200){
      let data = JSON.parse(xhr.responseText);
      if (data.medias.length==0 && loadState==0){
        let noMedias = `
          <h4 class="text-center mx-5 mt-5"> You haven't Tweeted any photos yet</h4>
          <p class="text-center text-muted">When you send Tweets with photos in them it will show up here.</p>
        `;
        document.getElementById("threads").innerHTML = noMedias;
        loadState += 1;
        getting = !getting;
      } else {
        renderMedias(data.medias);
        styleIconByState();
        getting = !getting;
        loadState += 1;
        maxState =  data.maxState;
      }
    }
  };
}



function showFollowModal(url){
  $("#follow-modal").modal("show");
  getProfiles(url);
}


function getProfiles(url, relatedOnly){
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url.slice(0, url.length-2)+`${loadState}`, true);
  xhr.send();
  xhr.onload = function(){
    if (xhr.status==200) {
      let data = JSON.parse(xhr.responseText);
      if (data.profiles.length > 0){
        
        if (relatedOnly){
          data.profiles = data.profiles.filter(profile => {
            if (profile.related){
              return profile;
            }
          });
        }
        $("#follow-modal").modal("show");
        renderProfiles(data.profiles);
      }
    }
  }; 
}

function renderProfiles(profiles){
  let container =  document.getElementById("profile-container");
  container.innerHTML = "";
  profiles.forEach(profile => {
    let profileHtml = `
      <div class="card border-bottom bg-light" onclick="changeUrlOnClick(event, '${profile.profileLink}')"> 
        <div class="card-body">
          <div class="row no-gutters">
            <div class="col-2 col-md-1">
              <a href="${profile.profileLink}" ><img src="${profile.profilePicture}" alt="icon" class="card-img rounded-circle" style="width: 3rem; height: 3rem;" /></a>
            </div>
            <div class="col-10 col-md-11">
              <div class="d-flex flex-row justify-content-between " style="height:2.5rem;">
                <div class="d-flex flex-column " >
                  <a href="${profile.profileLink}" class="font-weight-bold">${profile.name}</a>
                  <a href="${profile.profileLink}" class="text-muted">${profile.username} {followsyou}</a>
                </div>
                <button id="follow-icon-${profile.id}" class="btn btn-sm btn-primary badge-pill" onclick="followEventHandler(event, ${profile.id})"><span class="font-weight-bold">{follow}</span></button>
              </div>
              <p>${profile.bio||""}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    if (profile.following){
      profileHtml = profileHtml.replace("{follow}", "Following");
    } else {
      profileHtml = profileHtml.replace("{follow}", "Follow");
    }
    if (profile.follower){
      profileHtml = profileHtml.replace("{followsyou}", `<small class="mx-2 p-1 bg-white">Follows you</small>`);
    } else {
      profileHtml = profileHtml.replace("{followsyou}", "");
    }
    let loggedProfille = document.getElementById("id_logged-profile-username").value;
    if (profile.username == loggedProfille){
      profileHtml = profileHtml.replace(/(<button)([^]*)(<\/button>)/, "");
    }
    container.innerHTML += profileHtml;
  });
}


function followProfileAjax(profileId, btn){
  let url = document.getElementById("id_follow-profile-url").value;
  let csrf = Array.from(document.getElementsByName("csrfmiddlewaretoken"))[0];
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);
  let form = new FormData();
  form.append("profile_id", profileId);
  xhr.send(form);
  xhr.onload = function (){
    if (xhr.status === 201){
      let data = JSON.parse(xhr.responseText);
      btn.innerText = (btn.innerText=="Following") ? "Follow": "Following";
    }
  };
}


function followEventHandler(event, profileId, username){
  event.cancelBubble = true;
  followProfileAjax(profileId, event.target);
}

// Write functions to update numbers

function renderLikes(likes){
  likes.forEach(like => {
    let viewed_by = (like.you) ? "You": undefined;
    let likeHtml = constructLikeHtml(like, viewed_by);
    document.getElementById("threads").innerHTML += likeHtml;
  });
}


function renderMedias(medias){
  medias.forEach(media => {
    let viewed_by = (media.you) ? "You": undefined;
    let mediaHtml = constructLikeHtml(media, viewed_by, " ");
    document.getElementById("threads").innerHTML += mediaHtml;
  });
}


function constructLikeHtml(like, viewed_by, is_media){
  like.thread.date = new Date(like.thread.date);
  let likeHtml = `
    <div class="card mb-2" onclick="gotoDataUrl(event, '${like.thread.absolute_url}')"> 
      <div class="card-body">
        <div class="row no-gutters">
          ${is_media||`<div class="my-2 text-muted col-12 mx-3" onclick="gotoDataUrl(event, '${like.creator.profileLink}')">
            <svg width="1em" height="1em"  viewBox="0 0 16 16" class="bi bi-heart text-danger" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
            </svg> ${viewed_by||like.creator.username} Liked
          </div>`}
          <div class="col-2">
            <a href="${like.thread.creator.profileLink}" ><img src="${like.thread.creator.profilePicture}" alt="icon" class="card-img rounded-circle" style="width: 3rem; height: 3rem;" /></a>
          </div>
          <div class="col-10">
            <a href="${like.thread.creator.profileLink}">
              <span class="font-weight-bold">${like.thread.creator.name}<small class="text-muted">${like.thread.creator.username} ${dateToString(like.thread.date)}</small></span>
            </a>
            {{ thread-extra-detail }}
            <div class="my-2">
              <span class="lead">${like.thread.message.content}</span>
              {img}
            </div>
            <div class="d-flex flex-row justify-content-between align-items-center mt-2">
              <span id="reply-icon-${like.thread.id}" state="${like.thread.replyState}" class="icon" name="reply-icon" onclick="pushReplyModal(event, ${like.thread.id}, '{{reply-url}}', '${like.thread.creator.profileLink}', '${like.thread.creator.username}', '${like.thread.creator.profilePicture}')">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chat base" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                </svg> ${like.thread.replies}
              </span>
              <span id="retweet-icon-${like.thread.id}" state="${like.thread.retweetState}" class="icon" name="retweet-icon" onclick="cancelBubbleOnClick(event)">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-repeat" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                </svg> ${like.thread.retweets}
              </span>
              <span id="like-icon-${like.thread.id}" state="${like.thread.likeState}" class="icon" name="like-icon" onclick="likeIconClickEvent(event, ${like.thread.id}, '{{like-url}}', '${like.thread.creator.profileLink}', '${like.thread.creator.username}', '${like.thread.creator.profilePicture}')">
                <svg width="1em" height="1em"  viewBox="0 0 16 16" class="bi bi-heart" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                </svg> ${like.thread.likes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  let likeUrl = "";
  let replyUrl = "";
  let retweetUrl = "";
  let threadExtraDetail = "";
  if (like.thread.type == "Tweet"||like.thread.type == "Retweet"){
    likeUrl = document.getElementById("id_liketweet_url").value;
    replyUrl = document.getElementById("id_reply_url").value;
    retweetUrl = document.getElementById("id_retweet_url").value;
    likeHtml = likeHtml.replace(
      "cancelBubbleOnClick(event)",
      `pushRetweetFormModal(event, ${like.thread.id}, '${retweetUrl}', '${like.thread.creator.profilePicture}')`
      );
  } else if (like.thread.type == "Reply"){
    likeUrl = document.getElementById("id_like-reply_url").value;
    replyUrl = document.getElementById("id_reply-reply_url").value;
    let reciever;
    if (like.thread.tweet){
      reciever = like.thread.tweet.creator;
    } else if (like.thread.reply){
      reciever = like.thread.reply.creator;
    }
    threadExtraDetail = `<br><small class="text-muted"> <a class="text-primary" href="${like.thread.creator.profileLink}">${like.thread.creator.username}</a> Replied to <a class="text-primary" href="${reciever.profileLink}">${reciever.username}</a> </small>`;
  }
  likeHtml = likeHtml.replace("{{reply-url}}", replyUrl);
  likeHtml = likeHtml.replace("{{like-url}}", likeUrl);
  likeHtml = likeHtml.replace("{{ thread-extra-detail }}", threadExtraDetail);
  if (like.thread.message.media){
    let imgTag = `<img src="${like.thread.message.media}" name="previw-image" class="card-img rounded preview-imgage" onclick="imageShowFullview(event, ${like.thread.id})" >`;
    likeHtml = likeHtml.replace("{img}", imgTag);
  } else {
    likeHtml = likeHtml.replace("{img}", "");
  }
  return likeHtml;
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


function pushReplies(replies){
  replies.forEach(reply =>{
    let viewed_by;
    if (reply.you){
      viewed_by = "You";
    }
    let reciever;
    if (reply.tweet){
      reciever = reply.tweet.creator;
    } else if (reply.reply){
      reciever = reply.reply.creator;
    } 
    reply.date = new Date(reply.date);
    let replyCard = constructReplyHtml(reply, viewed_by, reciever);
    document.getElementById("threads").innerHTML += replyCard;
  });
  styleIconByState();
}


function constructReplyHtml(reply, viewed_by, reciever){
  let replyHTML = `
    <div class="card mb-2" onclick="changeUrlOnClick(event, '${reply.absolute_url}')"> 
      <div class="card-body">
        <div class="row no-gutters">
          <div class="col-2">
            <a href="${reply.creator.profileLink}" ><img src="${reply.creator.profilePicture}" alt="icon" class="card-img rounded-circle" style="width: 3rem; height: 3rem;" /></a>
          </div>
          <div class="col-10">
            <a href="${reply.creator.profileLink}">
              <span class="font-weight-bold">${reply.creator.name} <small class="text-muted">${reply.creator.username} ${dateToString(reply.date)}</small></span>
            </a>
            <br><small class="text-muted"> <a class="text-primary" href="${reply.creator.profileLink}">${viewed_by||reply.creator.username}</a> Replied to <a class="text-primary" href="${reciever.profileLink}">${reciever.username}</a> </small>
            <div class="my-2">
              <span class="lead">{msg}</span>
              {img}
            </div>
            <div class="d-flex flex-row justify-content-between align-items-center mt-2">
              <span id="reply-icon-${reply.id}" state="${reply.replyState}" class="icon" name="reply-icon" onclick="pushReplyModal(event, ${reply.id}, '${document.getElementById("id_reply-reply_url").value}', '${reply.creator.profileLink}', '${reply.creator.username}', '${reply.creator.profilePicture}')">
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
      let imgTag = `<img src="${reply.message.media}" name="previw-image" class="card-img rounded preview-imgage" onclick="imageShowFullview(event, ${reply.id})" >`;
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
    url = document.getElementById("id_like-reply_url").attributes.value.nodeValue;
  }
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);
  let body = JSON.stringify({ "id": id});
  xhr.send(body);
  xhr.onload = function () {
    if (this.status === 201) {
      let data = JSON.parse(this.responseText);
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
                    <input type="file" id="id_reply-media-content" accept="image/*" hidden>
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


function renderThreads(threads, onTop, viewed_by) {

  for (let thread of threads) {
    let isPushed = false;
    for (let t of pushedThreads) {
      if (deepEqual(t, thread)) {
        isPushed = true;
        break;
      } else if (thread.tweet){
        if (deepEqual(t, thread.tweet)){
          isPushed = true;
          break;            
        }
      } else if (thread.reply){
        if (deepEqual(t, thread.reply)){
          isPushed = true;
          break;            
        }
      }
    }
    if (isPushed) continue;
    pushedThreads.push(thread);
    let svgTypes = {
      "Like": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
      </svg>`,

      "Retweet": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-repeat" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
      <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
      </svg>`,

      "Reply": `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chat base" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
      </svg>
      `,
    };
    let card = document.createElement("DIV");
    let cardBody = document.createElement("DIV");
    let cardRow = document.createElement("DIV");
    let cardImageCol = document.createElement("DIV");
    let cardBodyCol = document.createElement("DIV");
    card.className = "card my-3";
    card.appendChild(cardBody);
    cardBody.className = "card-body";
    if (thread.type == "Like" || thread.type == "Retweet" || thread.type == "Mention" || thread.type == "Reply") {
      if (thread.type == "Like" || thread.type == "Retweet" || thread.type == "Reply") {
        let cardBodyTop = document.createElement("DIV");
        if (thread.you){
          viewed_by = "You";
        }
        cardBodyTop.className = "col-12 m-3";
        let userDetails = `<span class="text-muted mb-5">
        <span class="text-primary">${svgTypes[thread.type]}</span>
        ${viewed_by||thread.creator.username}`;
        if (thread.type == "Like") {
          userDetails += " liked";
        } else if (thread.type == "Reply") {
          userDetails += " replied";
        } else if (thread.type == "Retweet") {
          userDetails += " retweeted";
        }
        cardBodyTop.innerHTML += userDetails;
        if (thread.message) {
          if (thread.message.content) {
            let cardTextContent = document.createElement("P");
            cardTextContent.className = "my-3 ml-5 text-muted";
            cardTextContent.innerText = `${thread.message.content}`;
            cardBodyTop.appendChild(cardTextContent);
          } else {
            if (thread.type == "Reply" && thread.reply != null){
              pushedThreads.push(thread.reply);
            } else {
              pushedThreads.push(thread.tweet);
            }
          }
        }
        cardBodyTop.setAttribute("data-url", thread.creator.profileLink);
        cardBodyTop.addEventListener("click", gotoDataUrl);
        cardRow.append(cardBodyTop);
      }
      if (thread.type == "Reply" && thread.reply != null){
        thread = thread.reply;
        continue;
      } else {
        thread = thread.tweet;
      }
    }
    card.setAttribute('data-url', thread.absolute_url);
    card.addEventListener('click', gotoDataUrl);
    cardBody.appendChild(cardRow);
    cardRow.className = "row no-gutters";
    cardRow.append(cardImageCol, cardBodyCol);
    cardImageCol.className = "col-2";
    cardBodyCol.className = "col-10";
    let img = document.createElement('IMG');
    img.src = thread.creator.profilePicture;
    img.className = "card-img rounded-circle";
    img.style = "width:3rem;height:3rem;";
    img.setAttribute("data-url", thread.creator.profileLink);
    img.addEventListener("click", gotoDataUrl);
    cardImageCol.appendChild(img);
    let userDetails = document.createElement("P");
    userDetails.className = "card-title lead";
    thread.date = new Date(thread.date);
    userDetails.innerHTML = `<strong>${thread.creator.name}</strong> <small class="text-muted">${thread.creator.username}. ${dateToString(thread.date)}</small>`;
    userDetails.setAttribute("data-url", thread.creator.profileLink);
    userDetails.addEventListener("click", gotoDataUrl);
    cardBodyCol.append(userDetails);
    if (thread.message) {
      if (thread.message.content) {
        let cardTextContent = document.createElement("P");
        cardTextContent.innerText = `${thread.message.content}`;
        cardBodyCol.appendChild(cardTextContent);
      }
      if (thread.message.media) {
        let cardImageContent = document.createElement("IMG");
        cardImageContent.className = 'card-image rounded my-3 preview-imgage';
        cardImageContent.src = `${thread.message.media}`;
        cardImageContent.setAttribute("data-toggle", "modal");
        cardImageContent.setAttribute("data-target", `#image-modal-${thread.id}`);
        cardImageContent.addEventListener("click", function(event){
          event.cancelBubble=true;
          addImageFullViewModal(thread.id, thread.message.media);
          $(`#image-modal-${thread.id}`).modal("show");
        });
        cardBodyCol.appendChild(cardImageContent);
      }
    }

    
    let cardBase = document.createElement("DIV");
    cardBase.className = "d-flex flex-row mt-auto justify-content-between align-items-center";
    cardBase.innerHTML = `
    <div class="icon" id="reply-icon-${thread.id}" name="reply-icon-${thread.id}" state="${thread.replyState}" >${svgTypes.Reply} ${thread.replies}</div>
    <div class="icon" id="retweet-icon-${thread.id}" name="retweet-icon-${thread.id}"  state="${thread.retweetState}" >${svgTypes.Retweet} ${thread.retweets}</div>
    <div class="icon" id="like-icon-${thread.id}" name="like-icon-${thread.id}" state="${thread.likeState}" >${svgTypes.Like} ${thread.likes}</div>
    `;
    
    Array.from(cardBase.children).forEach((icon)=>{
      if (/like/.test(icon.id)) {
        icon.addEventListener("click", likeIconClickHandler);
        if (icon.attributes.state.nodeValue === "true"){
          icon.firstChild.attributes.fill.nodeValue = "red";
        }
      } else if (/retweet/.test(icon.id)) {
        icon.addEventListener("click", function(event){retweetIconClickEvent(event, thread);});
        if (icon.attributes.state.nodeValue === "true"){
          icon.firstChild.attributes.fill.nodeValue = "blue";
        }
      } else {
        icon.addEventListener("click", function(event){replyIconClickEvent(event, this, thread);});
        
        if (icon.attributes.state.nodeValue === "true"){
          icon.firstChild.attributes.fill.nodeValue = "green";
        }
      }
    });
    cardBodyCol.appendChild(cardBase);

    //push card 
    if (onTop) {
      document.getElementById("threads").prepend(card);
    } else {
      document.getElementById("threads").append(card);
    }
  }

}



function gotoDataUrl(event, url){
  event.cancelBubble =  true;
  if (!url){
    url =  this.attributes["data-url"].nodeValue;
  }
  window.location.href = url;
}


function addImageFullViewModal(id, imgSrc) {
  let modal = `
    <div id="image-modal-${id}" class="modal fade" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="img">
        <div class="modal-content">
          <div class="imageFullView" style="background-image: url('${imgSrc}');">
            <div class="close border text-center" data-dismiss="modal" aria-label="Close">
              &times;
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("ImageModals").innerHTML = modal;
}


function likeIconClickHandler(event){
    let icon = this;
    event.cancelBubble = true;
    let url = document.getElementById("id_liketweet_url").attributes.value.nodeValue;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.onload = function () {
      if (this.status == 201) {
        let data = JSON.parse(this.responseText);
        pushedThreads.push(data.thread);
        let iconDub = Array.from(document.getElementsByName(icon.attributes.name.nodeValue));
        if (icon.attributes.state.nodeValue == "true") {
          for (let icon of iconDub){
            let iconSVG = icon.children[0];
            let iconValue = Number(icon.innerText);
            iconSVG.attributes.fill.nodeValue = "black";
            iconValue--;
            if (iconValue < 1) iconValue = 0;
            icon.innerHTML = "";
            icon.append(iconSVG, " ", iconValue);
            icon.attributes.state.nodeValue = "false";
          }
        } else {
          for (let icon of iconDub){
            let iconSVG = icon.childNodes[0];
            let iconValue = Number(icon.innerText);
            iconSVG.attributes.fill.nodeValue = "red";
            iconValue++;
            icon.innerHTML = "";
            icon.append(iconSVG, " ", iconValue);
            icon.attributes.state.nodeValue = "true";
          }
        }
      }
    };
    xhr.setRequestHeader("X-CSRFToken", csrf.value);
    let body = JSON.stringify({ "id": /\d+/.exec(this.id)[0]});
    xhr.send(body);
}


function retweetIconClickEvent(event, thread){
  event.cancelBubble = true;
  pushRetweetOptionsModal(thread);
  $(`#retweet-modal-${thread.id}`).modal("show");
}


function pushRetweetOptionsModal(thread){
  let id = thread.id;
  let modal = `
    <div class="modal fade" id="retweet-modal-{id}" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-sm modal-dialog modal-dialog-bottom" role="document">
        <div class="modal-content border-0 fixed-bottom bg-transparent">
          <div class="modal-body p-0 shadow bg-transparent ">
            <div class="card card-body" id="id_rwt-no-comment">
              Retweet without comment 
            </div>
            <div class="card card-body" id="id_rwt-comment">
              Retweet with comment 
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  modal = modal.replace("{id}", id);
  document.getElementById("RetweetModals").innerHTML = modal;
  document.getElementById('id_rwt-no-comment').addEventListener('click', function(event){
    event.cancelBubble = true;
    let url = document.getElementById("id_retweet_url").value;
    let icon = document.getElementById(`retweet-icon-${id}`);
    let body = {};
    sendThreadCommentAjax(url, id, icon, body);
    $(`#retweet-modal-${id}`).modal("hide");
  });
  document.getElementById("id_rwt-comment").addEventListener('click', function(event){
    event.cancelBubble = true;
    $(`#retweet-modal-${id}`).modal("hide");
    pushRetweetFormModal(thread);
    $(`#retweet-form-modal-${id}`).modal("show");
  });
  document.getElementById(`retweet-modal-${id}`).addEventListener('click', function(event){
    event.cancelBubble = true;
    $(`#retweet-modal-${id}`).modal("hide");
  });
}


function pushRetweetFormModal(thread){
  let id = thread.id;
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
                  <img class="rounded-circle" src="${thread.creator.profilePicture}" style="width: 3rem; height: 3rem;"/>
                </div>
                <div class="col-10" id="id_replyTweet" style="width: 100%;">
                  <textarea id="id_retweet-text-content" maxlength="400" class="form-control mb-2" style="width: 100%;height:25vh;" placeholder="Write a comment..."></textarea>
                </div>
                <div class="col-12">
                  <div id="retweet_preview-container" class="card-body m-1 p-1 text-center col-12">
                  
                  </div>
                  <div class="d-flex flex-row justify-content-between align-items-center border-top border-bottom py-3">    
                    <input type="file" id="id_retweet-media-content" accept="image/*" hidden>
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
  document.getElementById("id_submit_retweet").addEventListener("click",  function(event){
    event.preventDefault();
    let textField = document.getElementById("id_retweet-text-content");
    if (textField.value !== ""){
      let url = document.getElementById("id_retweet_url").value;
      let icon = document.getElementById(`retweet-icon-${id}`);
      let body = {
        "text-content": document.getElementById("id_retweet-text-content").value,
        "media-content": document.getElementById("id_retweet-media-content"),
      };
      sendThreadCommentAjax(url, id, icon, body);
      $(`#retweet-form-modal-${id}`).modal("hide");
    }
  });
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

function replyIconClickEvent(event, icon, thread){
  event.cancelBubble = true;
  let id = /\d+/.exec(icon.id)[0];
  pushReplyModals(id, null, thread);
  $(`#reply-modal-${id}`).modal("show");
}


function pushReplyModals(id, icon, thread){
  let modal = `
    <div class="modal fade" id="reply-modal-${id}" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="false" >
      <div class="modal-lg modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content border-0 container">
          <div class="d-flex flex-row juslakemadtify-content-between align-items-center p-1 border-bottom">
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
                  <img class="rounded-circle" src="${thread.creator.profilePicture}" style="width: 3rem; height: 3rem;"/>
                </div>
                <div class="col-10" id="id_replyTweet" style="width: 100%;">
                  <span class="text-primary"> Replying to <small ><a href="" class="text-muted">${thread.creator.username}</a></small></span> 
                  <textarea id="id_reply-text-content" maxlength="400" class="form-control mb-2" style="width: 100%;height:25vh;" placeholder="write a reply..."></textarea>
                </div>
                <div class="col-12">
                  <div id="preview-container" class="card-body m-1 p-1 text-center col-12">
                  
                  </div>
                  <div class="d-flex flex-row justify-content-between align-items-center border-top border-bottom py-3">    
                    <input type="file" id="id_reply-media-content" accept="image/*" hidden>
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
  document.getElementById("ReplyModals").innerHTML=modal;
  document.getElementById("id_submit_reply").addEventListener("click",  function(event){
    event.preventDefault();
    let textField = document.getElementById("id_reply-text-content");
    if (textField.value !== ""){
      let url = document.getElementById("id_reply_url").value;
      let icon = document.getElementById(`reply-icon-${id}`);
      let body = {
        "text-content": document.getElementById("id_reply-text-content").value,
        "media-content": document.getElementById("id_reply-media-content"),
      };
      sendThreadCommentAjax(url, id, icon, body);
      $(`#reply-modal-${id}`).modal("hide");
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
}


function sendThreadCommentAjax(url, comment_id, icon, body){
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
      pushedThreads.push(data.thread);
      
      // update all duplicates of thread in page
      let iconDub = Array.from(document.getElementsByName(icon.attributes.name.nodeValue));
      iconDub.forEach( (icon)=>{
        let iconSVG = icon.children[0];
        let iconValue = Number(icon.innerText);
        iconSVG.attributes.fill.nodeValue = "green";
        iconValue++;
        icon.innerHTML = "";
        icon.append(iconSVG, " ", iconValue);
        icon.attributes.state.nodeValue = "true";
      });
    } else {
      prompt(`${this.statusText}, ${this.responseText}`);
    }
  };
}

