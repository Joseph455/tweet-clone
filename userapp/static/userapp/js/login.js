
let page_1_url =  document.getElementById('id_login_url').value;
let page_2_url = document.getElementById('id_registration_url').value;
let page_3_url = document.getElementById('id_forgot-password_url').value;


function forgotPasswordForm(url){
  let formContainer = document.getElementById("form");
  let topText = document.getElementById("top-text");
  let form =  `
    <div class="text-left my-3 my-md-1">
      <input type="email" class="form-control" id="id_email" aria-describedby="inputGroupPrepend" placeholder="Email address" required>
      <div class="invalid-feedback">
        Please enter a valid email address.
      </div>
      <div class="valid-feedback">
        &checkmark; Ready
      </div>
    </div>
    <button id="id_submit" class="btn btn-primary inline w-100">Submit</button>
    <div class="text-left my-3 d-flex flex-column">
      <small id="page-1" class="text-primary p-1 link">Already have an account. Sign in</small>
      <small id="page-2" class="text-primary p-1 link">Don't yet have an account ? sign up</small>
    </div>
  `;
  formContainer.innerHTML = form;
  formContainer.setAttribute("action", page_3_url);
  topText.innerHTML = "Forgot password";
  document.getElementById("page-2").addEventListener("click", function(){signUpForm(page_2_url);});
  document.getElementById("page-1").addEventListener("click", function(){loginForm(page_1_url);});
}


function signUpForm(url) {
  let formContainer = document.getElementById("form");
  let topText = document.getElementById("top-text"); 
  let form =  `
    <div class="form-row p-1">
      <div class="col-12 col-md-6">
        <input type="text" class="form-control" id="id_first_name" aria-describedby="inputGroupPrepend" placeholder="First name" autocomplete="given-name" required />
        <div class="invalid-feedback">
          Please enter your first name. 
        </div>
      </div>
      <div class="col-12 col-md-6">
        <input type="text" class="form-control" id="id_last_name" aria-describedby="inputGroupPrepend" placeholder="Last name" autocomplete="family-name" required />
        <div class="invalid-feedback">
          Please enter your last name.
        </div>
      </div>
    </div>
    <div class="p-1">
      <input type="password" class="form-control" id="id_password" aria-describedby="inputGroupPrepend" placeholder="Password" autocomplete="new-password" required />
      <div class="invalid-feedback">
        Please enter a password.
      </div>
    </div>
    <div class="p-1">
      <input type="email" class="form-control" id="id_email" aria-describedby="inputGroupPrepend" placeholder="Email address"  autocomplete="email" required>
      <div class="invalid-feedback">
        Please enter a valid email address.
      </div>
    </div>
    <button id="id_submit" class="btn btn-primary inline w-100 ">Sign up</button>
    <div class="text-left my-1 d-flex flex-column">
      <small id="page-1" class="text-primary link">Already have an account. Sign in</small>
      <small id="page-3" class="text-primary link">Forgot your password ?...</small>
    </div>
  `;
  formContainer.innerHTML = form;
  formContainer.setAttribute("action", page_2_url);
  topText.innerHTML = "Fill to sign up";
  topText.className  = "text-center my-1";
  document.getElementById("page-1").addEventListener("click", function(){loginForm(page_1_url);});
  document.getElementById("page-3").addEventListener("click", function(){forgotPasswordForm(page_3_url);});
}


function loginForm(url){
  let formContainer = document.getElementById("form");
  let topText = document.getElementById("top-text"); 
  let form =  `
    <div class="text-left my-3 my-md-1 my-lg-3">
      <input type="email" class="form-control" id="id_email" aria-describedby="inputGroupPrepend" placeholder="Email address" autocomplete="email" required />
      <div class="invalid-feedback">
        Please enter a valid email address.
      </div>
      <div class="valid-feedback">
        &checkmark; Good to go
      </div>
    </div>
    <div class="text-left my-3 my-md-1 my-lg-3">
      <input type="password" class="form-control" id="id_password" placeholder="Password" autocomplete="current-password" required />
      <div class="invalid-feedback">
        Please enter a password.
      </div>
      <div class="valid-feedback">
        &checkmark; Good to go
      </div>
    </div>
    <button class="btn btn-primary w-100" type="submit">Sign In</button>
    <div class="text-left my-3 d-flex flex-column">
      <small id="page-3" class="text-primary p-1 link">Forgot your password ?...</small>
      <small id="page-2" class="text-primary p-1 link">Don't yet have an account ? sign up</small>
    </div>  
  `;
  formContainer.innerHTML = form;
  formContainer.setAttribute("action", page_1_url);
  topText.innerHTML = "Please sign in";
  document.getElementById("page-2").addEventListener("click", function(){signUpForm(page_2_url);});
  document.getElementById("page-3").addEventListener("click", function(){forgotPasswordForm(page_3_url);});
}


function getFormData(){
  let body = {};
  let email = document.getElementById("id_email");
  let f_name = document.getElementById("id_first_name");
  let l_name = document.getElementById("id_last_name");
  let p_word = document.getElementById("id_password");
  body.email = (email) ? email.value: null;
  body.first_name = (f_name) ? f_name.value: null;
  body.last_name = (l_name) ? l_name.value: null;
  body.password = (p_word) ? p_word.value: null;
  return body;
}


function submitFormAjax(url, body) {
  let csrf = Array.from(document.getElementsByName("csrfmiddlewaretoken"))[0];
  let xhr = new XMLHttpRequest();
  let form_data = new FormData();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", csrf.value);
  form_data.append("first_name", body.first_name);
  form_data.append("last_name", body.last_name);
  form_data.append("password", body.password);
  form_data.append("email", body.email);
  xhr.send(form_data);
  xhr.onload = function () {
    if (xhr.status == 200){
      let data  =  JSON.parse(xhr.responseText);
      if (data.url){
        window.location.href = data.url;
      }
      if (data.message){
        let alert = `
          <div class="alert alert-dismissible alert-success fade show" role="alert">
            ${data.message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        `;
        document.getElementById("messaage").innerHTML = alert;
      }
    } else if (xhr.status == 404){
      let data  =  JSON.parse(xhr.responseText);
      if (data.errors){
        let msg = document.getElementById("message");
        Array.from(data.errors).forEach( error => {
          let alert = `
            <div class="alert alert-dismissible alert-danger fade show" role="alert">
              ${error}
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          `;
          msg.innerHTML += alert;
        });
      }         
    } else if (xhr.status == 403){
      // incase csrf token has expired 
      window.location.reload();
    }
  };
}
