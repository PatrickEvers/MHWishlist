const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');
const fsasync = fs.promises;
var request = require("request");


document.getElementById('loginBtn').addEventListener('click', () =>{
  document.getElementById('login').style.display = 'none';
  document.getElementById('main-list').style.display = 'block';

  var userName = document.getElementById('user-name').value;
  var URL = 'https://mhwishlist-rest.patrickevers.now.sh/item';
  createUser();

  const ul = document.querySelector('ul');

  //Lade Items aus der Datenbank in die Liste
  var options = {
        method: 'GET',
        url: `${URL}`,
        qs: {username: `${userName}`},
        headers: {'content-type': 'application/json'}
      };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);
            var bodyJSON = JSON.parse(body);
            var list = bodyJSON.items;

            for(var i = 0; i < list.length; i++){
              if(list[i] != ""){
                if(ul.className = ""){
                  ul.className = 'collection';
                }
                var itemName = list[i].name;
                var itemAmount = list[i].amount;
                addItemToList(itemName.replace('\r',''),itemAmount.replace('\r',''),true);
              }
            }
      });

  //Funktion zum Empfangen der Daten aus dem addWindow
  //Erstellt neues li mit Inhalt aus dem Formular
  ipcRenderer.on('item:add', (e, item, amount) => {
    addItemToList(item[0].replace('\r',''),item[1].replace('\r',''), false);
  });

  ipcRenderer.on('item:clear', () => {
      ul.innerHTML = '';
      ul.className = '';
      updateEntry('','','deleteAll');
  });

  function addItemToList(itemName,itemAmount,appStart){
    ul.className = 'collection';
      const li = document.createElement('li');
      const deleteBtn = document.createElement('button');
      const input = document.createElement('input');

      li.className = 'collection-item';
      li.id = itemName;

      deleteBtn.textContent = 'Delete';
      deleteBtn.id = 'DeleteBtn';
      deleteBtn.addEventListener('click', () => {
        
        updateEntry(deleteBtn.parentElement.id,"0",'delete');

        deleteBtn.parentElement.remove();
        if(ul.children.length == 0){
          ul.className = '';
        }
      });

      input.type = 'number';
      input.id = itemName + 'Amount';

      input.addEventListener('change', () =>{
        var timeout = null;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          var itemName = document.getElementById(input.id.replace('Amount','')).textContent.replace(' xDelete','');
          updateEntry(itemName,input.value,'update');
        },750);
      })
      
      //Wenn noch kein Eintrag für das Item vorhanden ist, füge es neu hinzu
      if(document.getElementById(li.id) == null){
        input.value = itemAmount;
        const itemText = document.createTextNode(itemName + ' x');
        li.appendChild(itemText);
        li.appendChild(input);
        li.appendChild(deleteBtn);
        ul.appendChild(li);
        
        if(appStart == false){
        //Speichern des neuen Eintrags in die Datenbank.
          updateEntry(itemName, itemAmount, 'upsert');
        }
      }
      //Wenn ein Eintrag vorhanden ist aktualisiere die Anzahl des benötigten Items
      else{
        const inputAmount = document.getElementById(itemName+'Amount').value;
        var amount = parseInt(inputAmount,10);
        amount += parseInt(itemAmount,10);
        const itemText = itemName + ' x';
        input.value = amount;
        
        document.getElementById(li.id).textContent = itemText;
        document.getElementById(li.id).appendChild(input);
        document.getElementById(li.id).appendChild(deleteBtn);

        updateEntry(itemName, amount, 'update');
      }
  }
 
  //Funktion zum Updaten
  function updateEntry(itemName, itemAmount, mode){
    var options = {
      method: 'GET',
      url: `${URL}`,
      qs: {username: `${userName}`},
      headers: {'content-type': 'application/json'}
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
          var bodyJSON = JSON.parse(body);
          var list = bodyJSON.items;
          
          if(mode == 'upsert'){
            var newItem = JSON.parse(`{"name": "${itemName}","amount": "${itemAmount}"}`);
            list.push(newItem);           
          }
          else if(mode == 'update'){
            for(var i = 0; i < list.length; i++){
              if(list[i].name == itemName){
                list[i].amount = itemAmount;
              }
            } 
          }
          else if(mode == 'delete'){
            for(var i = 0; i < list.length; i++){
              if(list[i].name == itemName){
                list.splice(i,1);
              }
            }
          }
          else if(mode == 'deleteAll'){
              list.splice(0,list.length);
          }
          updateUser(list);
    });
  }

  function updateUser(itemList){
    var options = {
      method: 'PUT',
      url: `${URL}`,
      qs: {username: `${userName}`},
      headers: {'content-type': 'application/json'},
      body: {
        username: `${userName}`,
        items: itemList
      },
      json: true
    };
    
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    });
  }

  function createUser(){
    var options = {
      method: 'POST',
      url: `${URL}`,
      headers: {'content-type': 'application/json'},
      body: {username: `${userName}`, items: []},
      json: true
    };
    
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    });
  }
})