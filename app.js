const selectEquipment = document.querySelector('[data-js="select-equipment"]');
const equipmentImage = document.querySelector('[data-js="equipment-img"]');
const form = document.querySelector('form');
const connectButton = document.querySelector('#connectButton');
const usersFile = document.querySelector('#usersFile');
const alertMessage = document.querySelector('[data-js="alertMessage"]');

// OBTER TOKEN
const getToken = async (ip, user, pass) => {
    const raw = JSON.stringify({
        "login": user,
        "password": pass
      });

    const settings = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: raw,
        redirect: 'follow'
    };

    try {
        const result = await (await fetch(`https://${ip}/login.fcgi`, settings)).text();
        const { session } = JSON.parse(result);

        return session;
    } catch (error) {
        return 'error';
    }
}

//CONECTAR NO EQUIPAMENTO
const connectEquipment = async () => {
    setLoadingAnimation();

    const { ipAddress, username, password } = form;
    const token = await getToken(ipAddress.value, username.value, password.value);
    const isValidSession = token !== 'error';

    setLocalStorage(token);

    if (isValidSession) {
        setConnectButtonProperty('success');
        return;
    }
    
    setConnectButtonProperty('danger');
    await setAlertMessage('Falha ao conectar com o equipamento.', 'alert-danger');
    setTimeout(() => {
        setConnectButtonProperty('secondary');
        alertMessage.classList.toggle('d-none');
    }, 3000);
    return;
}

//SALVAR O TOKEN NO LOCALSTORE
const setLocalStorage = token => localStorage.setItem('session', token);

//VERIFICAR SE O TOKEN É VÁLIDO
const getValidSessionToken = async (ip) => {
    const settings = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
    };
    const { session } = localStorage;
    const response = await (await fetch(`https://${ip}/session_is_valid.fcgi?session=${session}`, settings)).text();
    const { session_is_valid } = JSON.parse(response);
    return session_is_valid;
}

//INSERIR ANIMAÇÃO DE CARREGAMENTO
const setLoadingAnimation = () => {
    const spinner =
    `<div class="spinner-border spinner-border-sm text-light" role="status">
        <span class="visually-hidden"></span>
    </div>`;
    connectButton.textContent = '';
    connectButton.insertAdjacentHTML('afterbegin', spinner)
}

//INSERIR MENSAGEM DE ALERTA
const setAlertMessage = async (message, property) => {
    alertMessage.textContent = message;
    alertMessage.classList.remove(...alertMessage.classList);
    alertMessage.classList.add('alert', 'mt-3', 'text-center', 'd-none', property);
    alertMessage.classList.toggle('d-none');
}

//ALTERAR PROPRIEDADES DO BOTÃO CONECTAR
const setConnectButtonProperty = property => {
    const alert = {
        success: {
            msg: 'Conectado',
            color: 'btn-success'
        },
        danger: {
            msg: 'Desconectado',
            color: 'btn-danger'
        },
        secondary: {
            msg: 'Reconectar',
            color: 'btn-secondary'
        }
    };

    connectButton.classList.remove(...connectButton.classList);
    connectButton.classList.add('btn', 'btn-block', alert[property].color);
    connectButton.textContent = alert[property].msg;
}

//CADASTRAR EMPRESA
const editCompany = async ip => {
    const { session } = localStorage;
    const isValidSession = session !== 'error';

    const raw = JSON.stringify({
        "company": {
            "tipo_doc": 1,
            "cpf_cnpj": 48502603000118,
            "cei": 000000000000,
            "cpf": 00000000001,
            "name": "MASSISTEC",
            "address": "RUA TABACARANA 199"
        }
    });

    const settings = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: raw
    }

    if (isValidSession) {
        try {
            await fetch(`https://${ip}/edit_company.fcgi?session=${session}`, settings);
            await setAlertMessage('Empregador cadastrado com sucesso.', 'alert-success');
            alertMessage.classList.toggle('d-none');
        } catch (error) {
            await setAlertMessage('Falha ao cadastrar o empregador.', 'alert-danger');
            alertMessage.classList.toggle('d-none');
        }
    }
}

//IMPORTAR USUÁRIOS
const importUsers = async (ip, file) => {
    const { session } = localStorage;
    const isValidSession = session !== 'error';
    const settings = {
        method: 'POST',
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": file.size
        },
        body: file
    }

    if (isValidSession) {
        try {
            await fetch(`https://${ip}/import_users_csv.fcgi?session=${session}`, settings);
            await setAlertMessage('Usuários importados com sucesso.', 'alert-success');
            alertMessage.classList.toggle('d-none');
        } catch (error) {
            await setAlertMessage('Falha ao importar os usuários.', 'alert-danger');
            alertMessage.classList.toggle('d-none');
        }
    }
}

//ALTERAR CONFIGURAÇÕES DE REDE
const setSystemNetwork = async ip => {
    const { session } = localStorage;
    const isValidSession = session !== 'error';
    const raw = JSON.stringify({
        "ip": "192.168.0.200",
        "netmask": "255.255.255.0",
        "gateway": "192.168.0.1",
        "dns": "192.168.0.1"
    });

    const settings = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: raw
    }

    if (isValidSession) {
        try {
            await fetch(`https://${ip}/set_system_network.fcgi?session=${session}`, settings);
            await setAlertMessage('Configurações de rede alterada com sucesso.', 'alert-success');
            alertMessage.classList.toggle('d-none');
        } catch (error) {
            await setAlertMessage('Falha ao alterar configurações de rede.', 'alert-danger');
            alertMessage.classList.toggle('d-none');
        }
    }
}

// OBTER OBJETO CONTENDO A LISTA DE USUÁRIOS
const getUsersList = async ip => {
    const { session } = localStorage;
    const isValidSession = session !== 'error';

    if (isValidSession) {
        const { session } = localStorage;
        const raw = JSON.stringify({
            "limit": 100,
            "offset": 300
        });
        const settings = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: raw
        }

        try {
            const response = await (await fetch(`https://${ip}/load_users.fcgi?session=${session}`, settings)).text();
            const { users } = JSON.parse(response);
            return users;
        } catch (error) {
            return 'error';
        }
        
    }

    console.log('Sessão não é válida!');
}

// INSERIR OS DADOS NO EQUIPAMENTO
const setEquipmentData = e => {
    e.preventDefault();
    const { ipAddress, username, password } = form;

    editCompany(ipAddress.value, username.value, password.value);
    importUsers(ipAddress.value, usersFile.files[0]);
    setSystemNetwork(ipAddress.value);
    setAlertMessage('Equipamento configurado com sucesso.', 'alert-success');
    setTimeout(() => location.reload(), 5000);
}

//ALTERAR FOTO DO EQUIPAMENTO
const changeEquipment = e => equipmentImage.src = `./img/${e.target.value}.png`;

//EVENT LISTENERS
selectEquipment.addEventListener('change', changeEquipment);
connectButton.addEventListener('click', connectEquipment);
form.addEventListener('submit', setEquipmentData);