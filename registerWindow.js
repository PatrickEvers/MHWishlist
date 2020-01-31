const remote = require('electron').remote;
var request = require("request");

addEventListener('submit', submitForm);
var URL = 'https://mhwishlist-rest.patrickevers.now.sh/item';

function submitForm(e){
  e.preventDefault();

  var email = document.getElementById('email').value;
  var userName = document.getElementById('username').value;

  var options = {method: 'GET', url: 'https://mhwishlist-rest.patrickevers.now.sh/userexists', qs: {email: `${email}`}};

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    if(body == 'true'){ 
      document.getElementById('ErrorMsg').textContent = "E-Mail is already taken!";
    }
    else{
      document.getElementById('ErrorMsg').textContent = "";
      var options = {
          method: 'POST',
          url: `${URL}`,
          headers: {'content-type': 'application/json'},
          body: {username: `${userName}`, email: `${email}`, items: []},
          json: true
        };
          
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
          console.log(body)
          var window = remote.getCurrentWindow();
          window.close();
        });
    }
  });     
}