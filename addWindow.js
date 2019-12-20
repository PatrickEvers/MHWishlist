const electron = require('electron');
const {ipcRenderer} = electron;
const fs = require('fs');

var itemFile = fs.readFileSync('items.txt').toString().split('\n');
const select = document.getElementById('item');
for(var i = 0; i < itemFile.length; i++)
{
  const option = document.createElement('option');
  option.value = itemFile[i];
  option.textContent = itemFile[i];
  select.appendChild(option);
}

const form = document.querySelector('form');
addEventListener('submit', submitForm);

function submitForm(e){
    e.preventDefault();
    const item = [document.querySelector('#item').value, document.querySelector('#amount').value];
    ipcRenderer.send('item:add', item);
}