const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');
const fsasync = fs.promises;
var request = require("request");

const ul = document.querySelector('ul');

//Lade Items aus der Datenbank in die Liste
var options = {
  method: 'GET',
  url: 'http://localhost:3000/item',
  headers: {'content-type': 'application/json'}
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  
    if(body != '[]'){
      var list = JSON.parse(body);

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
    fsasync.writeFile('List.txt','','utf8');
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
      var options = {
        method: 'DELETE',
        url: 'http://localhost:3000/item',
        qs: {name: `${deleteBtn.parentElement.id}`},
        headers: {'content-type': 'application/json'}
      };
      console.log(deleteBtn.parentElement.id)
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
      
        console.log(body);
      });

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
        updateEntry(itemName,input.value);
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
        saveEntry(itemName, itemAmount);
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

      updateEntry(itemName, amount);
    }
}

//Update des Datenbankeintrags
function updateEntry(itemName, itemAmount){
  var options = {
    method: 'PUT',
    url: 'http://localhost:3000/item',
    qs: {name: `${itemName}`},
    headers: {'content-type': 'application/json'},
    body: {name: `${itemName}`, amount: `${itemAmount}`},
    json: true
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  
    console.log(body);
  });
}

//Speichern eines neuen Items in der Datenbank
function saveEntry(itemName, itemAmount){
  var options = {
    method: 'POST',
    url: 'http://localhost:3000/item',
    headers: {'content-type': 'application/json'},
    body: {name: `${itemName}`, amount: `${itemAmount}`},
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
}