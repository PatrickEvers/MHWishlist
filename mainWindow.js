const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');
const fsasync = fs.promises;

const ul = document.querySelector('ul');

var appStart = true;

//Schreibe Inhalt der Textdatei in die Liste.
var list = fs.readFileSync('List.txt', 'utf8').toString().split('\n');
for(var i = 0; i < list.length; i++){
  if(list[i] != ""){
    if(ul.className = ""){
      ul.className = 'collection';
    }
    addItemToList(list[i].substring(0,list[i].lastIndexOf(' x')),list[i].substring(list[i].lastIndexOf(' x')+2), appStart);
  }
}
appStart = false;

//Funktion zum Empfangen der Daten aus dem addWindow
//Erstellt neues li mit Inhalt aus dem Formular
ipcRenderer.on('item:add', (e, item, amount) => {
  addItemToList(item[0],item[1], appStart);
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
      var fileContent = fs.readFileSync('List.txt').toString();
      var line = document.getElementById(li.id).textContent.replace('Delete','') + input.value;
      
      fileContent = fileContent.replace('\n','');
      fileContent = fileContent.replace(line,'');
      fsasync.writeFile('List.txt',fileContent,'utf8');

      deleteBtn.parentElement.remove();
      if(ul.children.length == 0){
        ul.className = '';
      }
    });

    input.type = 'number';
    input.id = itemName + 'Amount';
    input.addEventListener('focus', () =>{
      input.oldvalue = input.value;
    })
    input.addEventListener('change', () =>{
      var timeout = null;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        var oldContent = document.getElementById(input.id.replace('Amount','')).textContent.replace('Delete','') + input.oldvalue;
        var newContent = document.getElementById(input.id.replace('Amount','')).textContent.replace('Delete','') + input.value;
        updateEntry(oldContent,newContent);
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
      //Speichern des neuen Eintrags in die Datei.
      var content = itemName + ' x' + itemAmount + '\n';
      fsasync.appendFile('List.txt',content,'UTF8');
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

      var oldContent = itemText + parseInt(inputAmount,10);
      var newContent = itemText + amount;
      
      updateEntry(oldContent, newContent);
    }
}

function updateEntry(oldContent, newContent){
  //Ersetzen des vorhanden Eintrags, damit die Anzahl aktuell ist
  fs.readFile('List.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace(oldContent, newContent);
    
    fs.writeFile('List.txt', result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}