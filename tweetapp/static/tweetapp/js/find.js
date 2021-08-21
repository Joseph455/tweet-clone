

function searchAjax(container_id, value) {
  if (!value) return;
  let xhr = new XMLHttpRequest();
  xhr.open('GET', `username=${value}-amount=10/`, true);
  xhr.send();
  xhr.onload = function () {
    if (xhr.status == 200) {
      let data = JSON.parse(xhr.responseText);
      if (data.results.length !== 0) {
        pushProfiles(data.results, container_id);
      } else {
        document.getElementById(container_id).innerHTML = `
          <h4 class="my-auto mx-auto"> Find and connect with people... </h4>
        `;
      }
    }
  };
}


function pushProfiles(results, container_id){
  let container = document.getElementById(container_id);
  container.innerHTML = "";
  for (let i=0; i<results.length; i++){
    let profile = results[i];
    let profileHtml =  `
      <div id="id_profile-${profile.id}" class="card w-100 my-2" style="min-height:3rem;height: 5.5rem; max-height:7rem;"> 
        <div class="card-body">
          <div class="row no-gutters">
            <div class="col-2 col-md-1">
              <img src="${profile.profilePicture}" alt="icon" class="card-img rounded-circle" style="width: 3rem; height: 3rem;" />
            </div>
            <div class="col-10 col-md-11">
              <div class="">
                <span class="d-flex flex-column font-weight-bold">
                  ${profile.name}
                  <small class="text-muted">${profile.username} {follow-state}</small>
                  <span class="text-muted p-0">${profile.bio||""}<span>
                </span>
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
    document.getElementById(`id_profile-${profile.id}`).addEventListener("click", function(event){
      event.cancelBubble = true;
      window.location.href = profile.profileLink;
    });
  });
}
