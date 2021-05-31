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
    let html = ""
    let total = 0.00;
    for (let i=data.length-1;i>=0;i--){
      let funcStringExcluir = `openModal(${data[i].id}, 'excluir')`
      let funcStringEditar = `openModal(${data[i].id}, 'editar')`
      let tipo = "success";
      if (data[i].tipo=="-"){
        tipo = "danger";
      }else if(data[i].tipo=="eA"){
        tipo = "warning";
      }else if(data[i].tipo=="eD"){
        tipo = "link"
      }
      html += `<div class="box is-dark">
      <div class="level is-mobile">
      <div class="level-left">
      <div class="level-item has-text-left ml-2">
      <div>
      <p class="subtitle is-7 mt-1">`;
      if (data[i].descricao.length>=44){
        data[i].descricao = [data[i].descricao.slice(0, 44), "<br>", data[i].descricao.slice(44)].join('')
      }
      if (data[i].descricao.length>=88){
        data[i].descricao = [data[i].descricao.slice(0, 88), "<br>", data[i].descricao.slice(88)].join('')
      }
      html += `${data[i].descricao} </div>
      </div>
    </div>
    <div class="level-right">
      <div class="level-item">
        <div>
          <button onclick="${funcStringExcluir}" class="delete is-small"></button>
        </div>
      </div>
    </div>
  </div>
  <div class="level is-mobile">
    <div class="level-left">
      <div class="level-item has-text-left ml-2">
        <div>
          <span class="tag is-${tipo} mr-2">R$${data[i].valor}</span>
          <span class="tag">${data[i].data}</span>
        </div>
      </div>
    </div>
    <div class="level-right">
        <div class="level-item">
          <div>
            <span onclick="${funcStringEditar}" style="cursor: pointer;" class="tag is-info">Editar</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;
      data[i].valor = data[i].valor.replace(",", ".");
      if (data[i].tipo=="eD") {
        data[i].valor=0
      }
      total+= (data[i].tipo=="+") ? Number(data[i].valor) : Number(data[i].valor*-1);    
    }
    table.innerHTML=html
    
    let labelTotal = document.getElementById("totalReal");
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
      if (response.data.length<=1){
        data = '{"real": []}';
      }
    }else{
      await Neutralino.filesystem.writeFile({
        fileName: './db.txt',
        data: '{"real": []}'
      });
      data = '{"real": []}';
    }
    return data;
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
      loadTable(dataJson["real"])
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
  
  let addEntry = async () => {
  
    try{
  
      let data = await getData();
      let dataJson = await JSON.parse(data);
      let valor = document.getElementById("valorInput").value;
      valor = valor.replace(",", ".");
      let desc = document.getElementById("descInput").value;
      let tipo = document.getElementById("tipoInput").value;
      let idMaior = 0
      for (let i=0;i<dataJson["real"].length;i++){
        if (dataJson["real"][i].id>=idMaior){
          idMaior=dataJson["real"][i].id;
        }
      }
      idMaior++;
      let dataAtual = new Date()
      dataAtual = dataAtual.toISOString().split('T')[0];
      let temp = {"id":idMaior,"valor": valor,"descricao":desc,"tipo": tipo,"data": dataAtual}
      dataJson["real"].push(temp);
      await saveData(dataJson);
      await start();
      closeModal();
      
    }catch(e){
      alert("Falha ao criar registro!");
    }
  
  }
  
  let ediEnt = async (id) => {
  
    try{
  
      let data = await getData();
      let dataJson = await JSON.parse(data);
      let valor = document.getElementById("valorInput").value;
      valor = valor.replace(",", ".");
      let desc = document.getElementById("descInput").value;
      for (let i=0;i<dataJson["real"].length;i++){
        if (dataJson["real"][i].id==id){
          dataJson["real"][i].valor=valor;
          dataJson["real"][i].descricao=desc;
          break;
        }
      }
      await saveData(dataJson);
      await start();
      closeModal();
      
    }catch(e){
      alert("Falha ao editar registro!");
    }
  
  }
  
  let deleteEnt = async (id) => {
  
    try{
  
      let data = await getData();
      let dataJson = await JSON.parse(data);
      for (let i=0;i<dataJson["real"].length;i++){
        if (dataJson["real"][i].id==id){
          dataJson["real"].splice(i,1);
        }
      }
      await saveData(dataJson);
      await start();
      closeModal();
      
    }catch(e){
      alert("Falha ao excluir registro!");
    }
  
  }
  
  Neutralino.init();
  //start();
  bulmaModalLogic();