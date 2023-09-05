function editNav() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// DOM Elements
const modalbg = document.querySelector(".bground");
const modalBtn = document.querySelectorAll(".modal-btn");
const formData = document.querySelectorAll(".formData");
const closeModal = document.querySelector('.close');
// const form =  document.querySelector('form');

// launch modal event
modalBtn.forEach((btn) => btn.addEventListener("click", launchModal));

// launch modal form
function launchModal() {
  modalbg.style.display = "block";
}

// close modal form

function closeModalForm(){
  modalbg.style.display = "none";
}


closeModal.onclick = (e) => closeModalForm();

const getValueButtonsRadios = (inputs) => 
  inputs.reduce((acc,radio) => (acc[radio.value] = radio.checked,acc), {})

const messagesErrorInputs = {
  first: { regex: /^[\w]{2,}/, message: 'Le prénom doit comporter au moins deux caractères'},
  last: {regex: /^[\w]{2,}/, message: 'Le nom doit comporter au moins deux caractères'},
  email: {regex:/^[\w\W]+[@]+[gmail|outlook|hotmail]+[.com|.fr]+$/, message: "l'email est invalide"},
  birthdate: {regex:/^([0]?[\d]{2}[\/]?)*([\d]{2})/, message: "Vous devez entrer votre date de naissance"},
  quantity: {regex: /[\d]+/, message:"La quantité n'est pas valide"},
  condition: {regex: /[^false]+/, message:"Vous devez vérifier que vous acceptez les termes et conditions."},
  // condition2: {regex: null, message: ''},
  location: { message: ' Vous devez choisir une option' }
}

function verifyFormDatasKeys(arrayFormDatas, keysToVerify){
  console.log('arrayFormDatas:', arrayFormDatas);
  const formDatasKeys = Object.keys(arrayFormDatas
  .reduce((acc, [name, value]) => 
    (acc[name] = value, acc), {}));
  console.log('formDatasKeys:', formDatasKeys)
  console.log('keysToVerify:', keysToVerify)
  return keysToVerify.map(keyToVerify => {
    const keyExist = formDatasKeys.indexOf(keyToVerify);
    return keyExist !== -1 ? keyExist: false; 
  })
  .reduce((acc, item, index) => (acc[keysToVerify[index]] = item, acc),{}) 
}

function addPayloadToAKeyDoesntExist(object, payloads){
    return Object.keys(object)
    .reduce((acc, key, index) => (acc[index] = [key, payloads[index]],acc), [])
}

function getKeysDoesntExist(object){
  return Object.keys(object)
    .map((name) => !object[name] ? name: null)
    .filter(name => name !== null)
    .reduce((acc, name) => 
      (acc[name] = object[name], acc), {})
}

function printErrorInput(parent, message){
  parent.setAttribute('data-error-visible', 'true');
  parent.setAttribute('data-error', message);
}

function removeErrorInput(parent){
  parent.removeAttribute('data-error-visible');
  parent.removeAttribute('data-error');
  return [];
}


function arrayIsEmpty(array){
  return array.length > 0;
}


function filterBy(array, name){
  return array.filter(items => items === name);
}


function onError([nameInput, value]){
  if((Object.keys(messagesErrorInputs)).indexOf(nameInput) === -1) return; // Si le input name ne ce trouve pas le l'objet avec sa regex de verification + son message alors c'est qu'elle ne peut pas être prise en compte.
  console.log(Object.keys(messagesErrorInputs).indexOf(nameInput));
  const { message, regex: expr } = messagesErrorInputs[nameInput]
  const { parent } = this;
  const regex = new RegExp(expr);

  const testValue = nameInput === 'location' && Array.isArray(value) ? 
    arrayIsEmpty(filterBy(value,true)) // on verifie si les valeur des checkboxes button radio existe une valeur qui est à true.
    :regex.test(value); // Sinon on agis selon le comportement de base et on test avec la regex fournis dans l'objet messagesErrorInputs.

  if(!testValue){
    printErrorInput(parent ,message);
    return message;
  }
  
  return removeErrorInput(parent);
}

function WhichFormData(name, cb){
  const form = document.forms[name];
  const inputs = Array.from(document.querySelectorAll(`form[name=${name}] input`));
  console.log('inputs: ',inputs);
  const self = this;
  form.onsubmit = (e) => {cb(e,{formData: self.formData, inputsMap: self.inputsMap})}

  const checkboxes = (contextMap, input) => contextMap.checkboxes ?  // Cette fonction verifie si la proprieter checkboxes est présente.
    {onError, parent: input.parentNode, 
      checkboxes: [...contextMap.checkboxes, input]} // La deuxieme fois qu'elle passe dans la boucle elle devrait se transformer en un tableau d'objet parce qu'on a plusieurs radio du même name.
    : {checkboxes:[contextMap.input, input]} // la premiere fois qu'elle passe dans la boucle elle est sensé être présente et n'est pas une collection ni un tableau.

  const inputMap = (inputs) => inputs.reduce((acc, input) => (  // Cette fonction permet de concatener l'ensemble des input dans un tableau d'objet référencent tous les input du formulaire. 
        acc[input.name] = acc[input.name] ? // On vérifie si la proprieter name existe dans l'accumulateur
        checkboxes(acc[input.name], input)  // Si elle existe déjà c'est que la boucle fais référence aux checkboxes button radio avec le même name, on les met tous dans le même tableau pour les vérifiés par la suite.
        : {input, parent: input.parentNode, onError}, acc),{}) // Sinon on continue à remplir le tableau de premier niveau avec les inputs qui ne sont pas encore référencer dans l'accumulateur.

  return (state, cb) => {
    this.inputsMap = inputMap(inputs);
    console.log(this.inputsMap);
    this.formData = new FormData(form);
    inputs.forEach(input => {
      input[state] = (e) => cb(e);
    })
  }
}

const validate = () => {
  const modalBody = document.querySelector('.modal-body');
  console.log('toto')
  modalBody.innerHTML = `
    <div class="success">
      <div class="text-success">
        <p>Merci pour votre inscription</p>
      </div>
      <div>
        <button class="btn-submit btn-close" name="close">Fermer</button>
      </div>
    </div>
  `
  const btnCloseModal = document.querySelector(`${modalBody.tagName} > div .btn-close`)
 btnCloseModal.onclick = () => closeModalForm();
} 

WhichFormData('reserve', (e, {inputsMap, formData}) => {
  e.preventDefault();
  const radios = Object.values(getValueButtonsRadios(inputsMap.location.checkboxes));
  let formDataMap = Array.from(formData)
  console.log("formDataMap:", formDataMap)
  const verifiedKeys = verifyFormDatasKeys(formDataMap, ['location','condition']);
  console.log('verifiedKeys:', verifiedKeys)
  const keysDoesntExist = getKeysDoesntExist(verifiedKeys);
  const payloadsEmptyKeys = addPayloadToAKeyDoesntExist(keysDoesntExist, [radios, 'off']); // les button type radio n'étent pas présente dans le formData de base on leurs rajoute une valeur par défaut.
  console.log("payloadsEmptyKeys:", payloadsEmptyKeys);
  formDataMap = formDataMap.concat(payloadsEmptyKeys); 

  const errors = formDataMap
    .map(([name, value]) => inputsMap[name].onError([name, value]))
    .filter(err => err.length > 0);

    if(!errors.length){
      validate();
    }
})('onchange', (e) => {
  const { name, value, checked, type } = e.target;
  const error = this.inputsMap[name].onError([name, value]);
  const valProxyfied = type === 'checkbox' ? checked:value;
  if(error && !error.length){
    this.formData.set(name, valProxyfied);
  }
});
