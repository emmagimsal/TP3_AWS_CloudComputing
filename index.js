const AWS = require("aws-sdk");
const { nanoid } = require('nanoid')

var dynamodb = new AWS.DynamoDB({
    apiVersion: "2012-08-10",
    endpoint: "http://dynamodb:8000",
    region: "us-west-2",
    credentials: {
        accessKeyId: "2345",
        secretAccessKey: "2345",
    },
});

var docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    service: dynamodb,
});

exports.handler = async (event) => {

    console.log("EVENTO: ", event);

    switch (event.httpMethod) {

        case "GET":
            //ListEnviosPendientes

            if (event.path === "/envios/pendientes") {
                let params = {
                    TableName: 'Envio',
                    IndexName: 'EnviosPendientesIndex'
                };

                let resp
                await docClient.scan(params, (err, data) => {
                    if (!err) {
                        resp = {
                            statusCode: 200,
                            body: (data.Items.length) ? data : 'El listado de envios pendientes se encuentra vacio',
                        }
                    }
                    else {
                        resp = {
                            statusCode: 500,
                            body: 'El listado de envios pendientes no se encuentra disponible',
                        }
                    }
                }).promise();

                return resp;
            }

        //Create Envío
        case "POST":
            if (event.path === '/envios') {
                let body = JSON.parse(event.body)
                if (!event.body || !body.email || !body.destino) {
                    console.log("BODY: ", body);
                    console.log("EMAIL: ", body.email);
                    console.log("DESTINO: ", body.destino);
                    return {
                        statusCode: 400,
                        body: 'La informacion enviada no esta completa, los campos requeridos son: destino, email'
                    }
                }
                let params = {
                    TableName: 'Envio',
                    Item: {
                        id: nanoid(),
                        fechaAlta: new Date().toLocaleString(),
                        destino: body.destino,
                        email: body.email,
                        pendiente: new Date().toLocaleString()
                    }
                };
                let resp
                await docClient.put(params, function (err, data) {
                    console.log("Data: ", data);
                    if (!err) {
                        resp = {
                            statusCode: 200,
                            body: params.Item
                        }
                    }
                    else {
                        resp = {
                            statusCode: 500,
                            body: 'No fue posible guardar el envio'
                        }
                    }
                }).promise()

                return resp
            }
        //MarcarEnviado
        case "PUT":
            if (event.path === `/envios/${event.pathParameters.idEnvio}/entregado`) {
                const id = event.pathParameters.idEnvio
                let params = {
                    TableName: "Envio",
                    Key: {
                        "id": event.pathParameters.idEnvio
                    },
                    UpdateExpression: "REMOVE pendiente",
                    ReturnValues: "ALL_NEW"
                };

                let resp
                await docClient.update(params, function (err, data) {
                    if (!err) {

                        if (Object.keys(data.Attributes).length === 1) {
                            resp = {
                                statusCode: 200,
                                body: `El envio con id ${id} no existe`
                            }
                        }
                        else {
                            resp = {
                                statusCode: 200,
                                body: data.Attributes
                            }
                        }
                    } else {
                        resp = {
                            statusCode: 500,
                            body: 'Fallo la actualizacion del envio seleccionado'
                        }
                    }
                }).promise();

                return resp
            }
            else {
                return {
                    statusCode: 400,
                    body: 'El id o la ruta ingresada es incorrecta'
                }
            }

        //Si se ingresa un método que no se encuentra definido
        default:
            return {
                statusCode: 400,
                body: `El metodo ${httpMethod} no esta disponible.`,
            };
    }
};
