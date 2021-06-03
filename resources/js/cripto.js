let closeModal = () => {

    let modal = document.getElementById("modal");
    modal.classList.remove('is-active');
  
  }
  
let bulmaModalLogic = () => {

  document.addEventListener('DOMContentLoaded', function () {

    // Modals
  
    var rootEl = document.documentElement;
    var $modals = getAll('.modal');
    var $modalButtons = getAll('.modal-button');
    var $modalCloses = getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button');
  
    if ($modalCloses.length > 0) {
      $modalCloses.forEach(function ($el) {
        $el.addEventListener('click', function () {
          closeModals();
        });
      });
    }
  
    document.addEventListener('keydown', function (event) {
      var e = event || window.event;
      if (e.keyCode === 27) {
        closeModals();
      }
    });
  
    function closeModals() {
      rootEl.classList.remove('is-clipped');
      $modals.forEach(function ($el) {
        $el.classList.remove('is-active');
      });
    }
  
    // Functions
  
    function getAll(selector) {
      return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }
  
  });

}

let loadTable = async (data) => {

  let table = document.getElementById("entries");
  table.innerHTML = "";
  let html = ""
  let total = 0.00;
  let coinsTemp = await getCoinData();
  let coins = []
  if (coinsTemp!=""){
    coinsTemp = JSON.parse(coinsTemp);
    coins = coinsTemp["coin"];
  }
  let dataAtual = new Date();
  let indexCoins = {};
  for (let i=0;i<coins.length;i++){
    indexCoins[coins[i].symbol]=i;
    coins[i].quant = 0.00;
    coins[i].total = 0.00;
  }
  for (let i=0;i<data.length;i++){
    if (data[i].tipo=="+"){
      coins[indexCoins[data[i].symbol]].quant+=Number(data[i].quant);
      coins[indexCoins[data[i].symbol]].total+=Number(data[i].valorPago);
    }
  }
  for (let i=0;i<coins.length;i++){
    let funcStringExcluir = `openModal('${coins[i].symbol}', 'excluirCoin')`
    let tag = "success";
    let arrow = "up";
    let price = coins[i].lastPrice;
    let dif = dataAtual - new Date(coins[i].lastPriceDate);
    dif = Math.round(((dif % 86400000) % 3600000) / 60000);
    if (dif >= 10 || coins[i].lastPrice=="0"){
      price = await fetchApi(coins[i].url, i, dataAtual.getTime());
    }
    total += Number(coins[i].quant)*Number(price);
    let valorPago = Number(coins[i].total)
    let valorAtual = Number(coins[i].quant)*Number(price);
    let lucro = valorAtual-valorPago;
    if (lucro<0){
      tag = "danger";
      arrow = "down";
    }
    html += `
    <div class="box is-dark">
      <div class="columns is-mobile">
        <div class="column is-auto is-1"><figure class="image is-32x32">
            <img class="is-rounded" src="${coins[i].logo}">
        </figure></div>
        <div class="column is-auto ml-2">
            <p class="title is-6">${coins[i].symbol}</p>
            <p class="subtitle is-7">R$${price}</p>
        </div>
        <div class="column is-auto mt-1" style="position: relative;left: -15px;">
            <p class="title is-7" onclick="openModal('${coins[i].symbol}', 'openCoin');" style="cursor: pointer;">${Number(coins[i].quant).toFixed(8)}</p>
            <p class="subtitle is-7">R$${valorAtual.toFixed(2)}</p>
        </div>
        <div class="column is-1" style="position: relative;left: -35px;top: 10px;">
          <span class="tag is-${tag} is-small mt-1">R$${lucro.toFixed(1)}<ion-icon class="seta" name="caret-${arrow}-outline"></ion-icon></span>
        </div>
        <div class="column is-1">
          <button onclick="${funcStringExcluir}" class="delete is-small"></button>
        </div>
      </div>
    </div>
    `;
    table.innerHTML=html
  }
  
  let labelTotal = document.getElementById("totalCripto");
  labelTotal.innerText = "R$"+Number(total).toFixed(2);
}

let getData = async () => {

  let response = await Neutralino.filesystem.readDirectory({
    path: NL_PATH
  });
  let temDb = false
  for(let i=0;i<response.entries.length;i++) {
    if(response.entries[i].entry=="db.txt"){
      temDb = true;
      break;
    }
  };
  let data = ""
  if (temDb){
    response = await Neutralino.filesystem.readFile({
      fileName: './db.txt'
    });
    data=response.data
  }
  return data;
}

let getCoinData = async () => {

  let response = await Neutralino.filesystem.readDirectory({
    path: NL_PATH
  });
  let temDb = false
  for(let i=0;i<response.entries.length;i++) {
    if(response.entries[i].entry=="coins.txt"){
      temDb = true;
      break;
    }
  };
  let data = ""
  if (temDb){
    response = await Neutralino.filesystem.readFile({
      fileName: './coins.txt'
    });
    data=response.data
  }
  return data;

}

let saveCoinData = async (data) => {

  await Neutralino.filesystem.writeFile({
    fileName: './coins.txt',
    data:  JSON.stringify(data)
  });

}

let saveData = async (dataT) => {
  
  await Neutralino.filesystem.writeFile({
    fileName: './db.txt',
    data:  JSON.stringify(dataT)
  });

}

let start = async () => {

  let data = await getData();
  try{
    let dataJson = JSON.parse(data);
    if (!dataJson.hasOwnProperty("cripto")){
      dataJson = {"cripto":[]}
    }
    loadTable(dataJson["cripto"]);
  }catch(e){

  }

}

let closeApp = async () => {
  await Neutralino.app.exit();
}

let openModal = async (id, daOnde) => {
  let titulo = "";
  let buttonColor = "";
  let buttonText = "";
  let desc = "";
  let buttonFunc = "";
  
  if (daOnde=="excluir"){
    titulo = "Excluir Registro";
    buttonColor = "is-danger";
    buttonText = "Excluir";
    desc = "<p>Tem certeza que deseja excluir o registro?</p>";
    buttonFunc = `'deleteEnt(${id})'`
  }else if (daOnde=="editar"){
    titulo = "Editar registro";
    buttonColor = "is-info";
    buttonText = "Editar";
    let data = await getData();
    let dataJson = await JSON.parse(data);
    let indexData = 0;
    for (let i=0;i<dataJson["real"].length;i++){
      if (dataJson["real"][i].id==id){
        indexData=i;
        break;
      }
    }
    desc = '<div class="columns">';
    desc += '<div class="column is-3"><div class="field"><label class="label is-small ml-1">Valor</label><p class="control has-icons-left">';
    desc += '<input id="valorInput" value="'+dataJson["real"][indexData].valor+'" class="input is-small is-rounded" type="text" placeholder="Valor"><span class="icon is-small is-left">';
    desc += '<ion-icon name="cash"></ion-icon></span></p></div>';
    desc += '</div>'
    desc += '<div class="column is-9"><div class="field"><label class="label is-small ml-1">Descrição</label><p class="control has-icons-left">';
    desc += '<input id="descInput" value="'+dataJson["real"][indexData].descricao+'" class="input is-small is-rounded" type="text" placeholder="Descrição"><span class="icon is-small is-left">';
    desc += '<ion-icon name="clipboard"></ion-icon></span></p></div>';
    desc += '</div></div>'
    
    buttonFunc = `'ediEnt("${id}")'`
  }else if (daOnde=="addEntry"){
    titulo = "Entry";
    buttonColor = "is-success";
    buttonText = "Save";
    desc = `<div class"ml-2">
    <div class="columns is-mobile">
      <div class="column is-4">
        <div class="field"><label class="label is-small ml-1">Valor</label><p class="control has-icons-left">
          <input id="valorInput" class="input is-small is-rounded" type="text" placeholder="Valor"><span class="icon is-small is-left">
          <ion-icon name="cash"></ion-icon></span></p>
        </div>
      </div>
      <div class="column is-8 ml-2">
        <div class="field ml-6"><label class="label is-small ml-1">Tipo</label><div class="control has-icons-left">
        <div class="select is-small is-rounded">
          <select id="tipoInput">
            <option selected value="+">Adicionar</option>
            <option value="-">Remover</option>
            <option value="D">Emprestar</option>
          </select>
        </div>
          <span class="icon is-small is-left">
            <ion-icon name="settings-outline"></ion-icon>
          </span></div>
        </div>
      </div>
    </div>
    <div class="columns is-mobile">
      <div class="column is-10"><div class="field"><label class="label is-small ml-1">Descrição</label><p class="control has-icons-left">
        <input id="descInput" class="input is-small is-rounded" type="text" placeholder="Descrição"><span class="icon is-small is-left">
        <ion-icon name="clipboard"></ion-icon></span></p></div>
      </div>
    </div></div>`;
    
    buttonFunc = `'addEntry()'`
  }else if (daOnde=="addCoin"){
    //logo
    //url
    //symbol

    titulo = "New Coin";
    buttonColor = "is-success";
    buttonText = "Add";
    desc = `<div class"ml-2">
    <div class="columns is-mobile">
      <div class="column is-4">
        <div class="field"><label class="label is-small ml-1">Symbol</label><p class="control has-icons-left">
          <input id="symbolInput" class="input is-small is-rounded" type="text" placeholder="Symbol"><span class="icon is-small is-left">
          <ion-icon name="logo-bitcoin"></ion-icon></span></p>
        </div>
      </div>
      <div class="column is-8">
        <div class="field"><label class="label is-small ml-1">Logo URL</label><p class="control has-icons-left">
          <input id="logoURLInput" class="input is-small is-rounded" type="text" placeholder="Logo URL"><span class="icon is-small is-left">
          <ion-icon name="image-outline"></ion-icon></span></p>
        </div>
      </div>
    </div>
    <div class="columns is-mobile">
      <div class="column is-12"><div class="field"><label class="label is-small ml-1">API URL</label><p class="control has-icons-left">
        <input id="urlInput" class="input is-small is-rounded" type="text" placeholder="API URL"><span class="icon is-small is-left">
        <ion-icon name="qr-code-outline"></ion-icon></span></p></div>
      </div>
    </div></div>`;
    
    buttonFunc = `'addCoin()'`
  }else if (daOnde=="excluirCoin"){
    titulo = "Excluir Coin";
    buttonColor = "is-danger";
    buttonText = "Excluir";
    desc = "<p>Tem certeza que deseja excluir "+id+"?</p>";
    buttonFunc = `'delCoin("${id}")'`
  }else if (daOnde=="openCoin"){
    titulo = id;
    buttonColor = "is-success";
    buttonText = "Save";
    let dataT = await getData();
    let data = [];
    data = await JSON.parse(dataT);
    let arrayIndex=[];
    let cont =1;
    if (data.hasOwnProperty('cripto')){
      for (let i=0;i<data["cripto"].length;i++){
        if (data["cripto"][i].symbol==id){
          arrayIndex[cont-1]=i;
          cont++;
        }
      }
    }
    if (cont>4){cont=4;}
    desc = `<div id="modalEntries" style="height: ${75*cont+05}px;">`;
    for (let i=0;i<arrayIndex.length;i++){
      desc += `
      <div class="columns is-mobile" id="row${data["cripto"][arrayIndex[i]].id}" style="height: 78px !important;">
        <div class="column is-4">
          <div class="field"><label class="label is-small ml-1">Quantidade</label><p class="control has-icons-left">
            <input id="quantInput${data["cripto"][arrayIndex[i]].id}" class="input is-small is-rounded" type="text" placeholder="0.00000000" value="${data["cripto"][arrayIndex[i]].quant}"><span class="icon is-small is-left">
            <ion-icon name="logo-bitcoin"></ion-icon></span></p>
          </div>
        </div>
        <div class="column is-4">
          <div class="field"><label class="label is-small ml-1">Valor</label><p class="control has-icons-left">
            <input id="valorInput${data["cripto"][arrayIndex[i]].id}" class="input is-small is-rounded" type="text" placeholder="Valor pago" value="${data["cripto"][arrayIndex[i]].valorPago}"><span class="icon is-small is-left">
            <ion-icon name="cash-outline"></ion-icon></span></p>
          </div>
        </div>
        <div class="column is-4">
          <div class="field"><label class="label is-small ml-1">Tipo</label><div class="control has-icons-left">
          <div class="select is-small is-rounded">
            <select id="tipoInput${data["cripto"][arrayIndex[i]].id}">
              <option ${(data["cripto"][arrayIndex[i]].tipo=="+") ? 'selected' : ''} value="+">Add</option>
              <option ${(data["cripto"][arrayIndex[i]].tipo=="-") ? 'selected' : ''}value="-">Rem</option>
            </select>
          </div>
          <span class="icon is-small is-left">
            <ion-icon name="settings-outline"></ion-icon>
          </span></div>
          <span onclick="delRow(${data["cripto"][arrayIndex[i]].id})" style="cursor: pointer;position: relative;right:-85px;top:-27px;" class="icon has-text-danger">
            <ion-icon name="close-circle-outline"></ion-icon>
          </span>
          </div>
        </div>
      </div>`;
    }
    desc += `
      <div class="columns is-mobile" id="row-0">
        <div class="column is-4">
          <div class="field"><label class="label is-small ml-1">Quantidade</label><p class="control has-icons-left">
            <input id="quantInput-0" class="input is-small is-rounded" type="text" placeholder="0.00000000" ><span class="icon is-small is-left">
            <ion-icon name="logo-bitcoin"></ion-icon></span></p>
          </div>
        </div>
        <div class="column is-4">
          <div class="field"><label class="label is-small ml-1">Valor</label><p class="control has-icons-left">
            <input id="valorInput-0" class="input is-small is-rounded" type="text" placeholder="Valor pago" ><span class="icon is-small is-left">
            <ion-icon name="cash-outline"></ion-icon></span></p>
          </div>
        </div>
        <div class="column is-4">
          <div class="field"><label class="label is-small ml-1">Tipo</label><div class="control has-icons-left">
          <div class="select is-small is-rounded">
            <select id="tipoInput-0">
              <option selected value="+">Add</option>
              <option value="-">Rem</option>
            </select>
          </div>
            <span class="icon is-small is-left">
              <ion-icon name="settings-outline"></ion-icon>
            </span></div>
          </div>
        </div>
      </div>
    </div>
    <div id="buttonRow" class="columns is-mobile" style="height: 25px; position: relative; top: 10px;">
      <div class="column is-4">
        <span onclick="addRow()" style="cursor: pointer;" class="icon has-text-link">
          <ion-icon  name="add-circle-outline"></ion-icon>
        </span>
        <span onclick="delLastRow()" style="cursor: pointer;" class="icon has-text-danger">
          <ion-icon name="close-circle-outline"></ion-icon>
        </span>
      </div>
    </div>
    <input id="delCoins" type="hidden">
    <input id="coinContRowToAdd" value="0" type="hidden">
    <input id="coinCont" value="${arrayIndex.length+1}" type="hidden">`;
    buttonFunc = `'saveCoins("${id}")'`
  }
  let button = "<button class='button "+buttonColor+"' onclick="+buttonFunc+" >"+buttonText+"</button>"
  let buttonModal = await document.getElementById('footModal');
  buttonModal.innerHTML = button
  let tituloModal = await document.getElementById('tituloModal');
  tituloModal.innerText = titulo
  let contModal = await document.getElementById('contModal');
  contModal.innerHTML = desc

  let modal = await document.getElementById("modal");
  modal.classList.add("is-active");

}

let addRow = async () => {

  let cont = Number(document.getElementById("coinContRowToAdd").value);
  let row = document.createElement('div');
  row.id = `row-${cont}`;
  row.className = "columns is-mobile"
  row.innerHTML = `
  <div class="column is-4">
    <div class="field"><label class="label is-small ml-1">Quantidade</label><p class="control has-icons-left">
      <input id="quantInput-${cont}" class="input is-small is-rounded" type="text" placeholder="0.00000000" ><span class="icon is-small is-left">
      <ion-icon name="logo-bitcoin"></ion-icon></span></p>
    </div>
  </div>
  <div class="column is-4">
    <div class="field"><label class="label is-small ml-1">Valor</label><p class="control has-icons-left">
      <input id="valorInput-${cont}" class="input is-small is-rounded" type="text" placeholder="Valor pago" ><span class="icon is-small is-left">
      <ion-icon name="cash-outline"></ion-icon></span></p>
    </div>
  </div>
  <div class="column is-4">
    <div class="field"><label class="label is-small ml-1">Tipo</label><div class="control has-icons-left">
    <div class="select is-small is-rounded">
      <select id="tipoInput-${cont}">
        <option selected value="+">Add</option>
        <option value="-">Rem</option>
      </select>
    </div>
      <span class="icon is-small is-left">
        <ion-icon name="settings-outline"></ion-icon>
      </span></div>
    </div>
  </div>
  `;

  let coinCont = document.getElementById("coinCont").value;
  document.getElementById("coinCont").value = (Number(coinCont)+1);
  if (Number(coinCont)+1>4){
    coinCont=3;
  }
  document.getElementById("modalEntries").style=`height: ${75*(Number(coinCont)+1)+05}px !important;`;
  let coinContRowToAdd = document.getElementById("coinContRowToAdd");
  coinContRowToAdd.value = Number(coinContRowToAdd.value)+1;

  let modal = document.getElementById("modalEntries");
  modal.appendChild(row);

}

let delLastRow = async () => {

  let cont = Number(document.getElementById("coinContRowToAdd").value);

  if (cont>0){

    let coinCont = document.getElementById("coinCont").value;
    document.getElementById("coinCont").value = (Number(coinCont)-1);
    if(Number(coinCont)-1>4){
      coinCont=5;
    }
    document.getElementById("modalEntries").style=`height: ${75*(Number(coinCont)-1)+05}px !important;`;

    let row = document.getElementById(`row-${cont-1}`);
    row.parentNode.removeChild(row);
    let coinContRowToAdd = document.getElementById("coinContRowToAdd");
    coinContRowToAdd.value = Number(coinContRowToAdd.value)-1;
  }

}

let delRow = async (id) => {

  let coinCont = document.getElementById("coinCont").value;
  document.getElementById("coinCont").value = (Number(coinCont)-1);
  if (Number(coinCont)-1>4){
    coinCont=5;
  }
  document.getElementById("modalEntries").style=`height: ${75*(Number(coinCont)-1)+05}px !important;`;

  let row = document.getElementById(`row${id}`);
  row.parentNode.removeChild(row);
  let del = document.getElementById("delCoins").value;
  if (del==""){
    del = `${id}`;
  }else{
    del += `,${id}`;
  }
  document.getElementById("delCoins").value=del;

}

let addCoin = async () => {

  let data = await getCoinData();
  let coins = {};
  let index = 0;
  if (data!=""){
    coins = await JSON.parse(data);
    index = coins["coin"].length;
  }else{
    coins = await JSON.parse('{"coin":[{"symbol":"","logo":"","url":"","lastPrice":"","lastPriceDate":""}]}')
    index = 0
  }
  coins["coin"][index] = {}
  coins["coin"][index].symbol = document.getElementById("symbolInput").value;
  coins["coin"][index].logo = document.getElementById("logoURLInput").value;
  coins["coin"][index].url = document.getElementById("urlInput").value;
  coins["coin"][index].lastPrice = await fetchApi(coins["coin"][index].url);
  let dataAtual = new Date();
  coins["coin"][index].lastPriceDate = dataAtual.getTime()-(600,000);

  await saveCoinData(coins);
  await start();
  closeModal();

}

let delCoin = async (symbol) => {

  try{

    let data = await getCoinData();
    let coins = [];
    if (data!=""){
      coins = await JSON.parse(data);
    }
    for (let i=0;i<coins["coin"].length;i++){
      if (coins["coin"][i].symbol==symbol){
        coins["coin"].splice(i,1);
      }
    }
    await saveCoinData(coins);
    await start();
    closeModal();
    
  }catch(e){
    alert("Falha ao excluir coin!");
  }

}

let saveCoins = async (symbol) => {

  try{

    let data = await getData();
    let dataJson = await JSON.parse(data);
    let idMaior = 0;
    let id = 0;
    let cont = document.getElementById("coinCont").value;
    let del = document.getElementById("delCoins").value;
    let arrayIndex = [];
    let arrayIndexDel = [];
    let fezAlgo = 0;
    if (!dataJson.hasOwnProperty("cripto")){
      dataJson.cripto = [];
    }
    for(let i=0;i<del.length;i++){
      if (del.charAt(i)!=","){
        arrayIndexDel[arrayIndexDel.length]=del.charAt(i);
      }
    }
    for (let i=0;i<dataJson["cripto"].length;i++){
      for (let j=0;j<arrayIndexDel.length;j++){
        if (dataJson["cripto"][i].id==arrayIndexDel[j]){
          dataJson["cripto"].splice(i,1);
          arrayIndexDel.splice(j,1);
          fezAlgo = 1;
        }
      }
      
    }
    for (let i=0;i<dataJson["cripto"].length;i++){
      if (dataJson["cripto"][i].symbol==symbol){
        arrayIndex[arrayIndex.length]=i; 
      }
      if (idMaior<dataJson["cripto"][i].id){
        idMaior=dataJson["cripto"][i].id;
      }
    }
    for(let i=0;i<arrayIndex.length;i++){
      let quant = document.getElementById(`quantInput${dataJson["cripto"][arrayIndex[i]].id}`).value;
      let valor = document.getElementById(`valorInput${dataJson["cripto"][arrayIndex[i]].id}`).value;
      let tipo = document.getElementById(`tipoInput${dataJson["cripto"][arrayIndex[i]].id}`).value;
      if (quant!="" && valor!=""){
        dataJson["cripto"][arrayIndex[i]].quant = quant.replace(",", ".");
        dataJson["cripto"][arrayIndex[i]].valorPago = valor.replace(",", ".");
        dataJson["cripto"][arrayIndex[i]].tipo = tipo;
        cont--;
        fezAlgo = 1;
      }
    }
    for(let i=0;i<Number(cont);i++){
      let quant = document.getElementById(`quantInput-${i}`).value;
      let valor = document.getElementById(`valorInput-${i}`).value;
      let tipo = document.getElementById(`tipoInput-${i}`).value;
      if (quant!="" && valor!=""){
        idMaior++;
        let temp = {};
        temp.id = idMaior;
        temp.quant = quant.replace(",", ".");
        temp.valorPago = valor.replace(",", ".");
        temp.tipo = tipo;
        temp.symbol = symbol;
        dataJson["cripto"].push(temp);
        fezAlgo = 1;
      }
    }
    if (fezAlgo==1){
      await saveData(dataJson);
      await start();
    }
    closeModal();
    
  }catch(e){
    alert("Falha ao salvar coins!");
    console.log(e);
  }

}

let fetchApi = async (url, index, data) => {
  try{
    let response = await Neutralino.os.execCommand({
      command: `curl "${url}"`
    });
    let rawData = response.output.slice(-200);
    let brlIndex = await rawData.indexOf('BRL');
    let priceUnfiltered = await rawData.slice((brlIndex+3), brlIndex+15+3);
    let price = priceUnfiltered.split('[')[1];
    price = price.split(',')[0];
    price = price.split('.')[0]+"."+price.split('.')[1].slice(0,2);
    let coins = await getCoinData();
    coins = JSON.parse(coins);
    coins["coin"][index].lastPriceDate = data;
    coins["coin"][index].lastPrice = price;
    await saveCoinData(coins);
    return price;
    
  }catch(e){
    console.log(e);
    return 0;
  }
  
  
}

Neutralino.init();
start();
bulmaModalLogic();