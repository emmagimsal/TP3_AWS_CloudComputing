# TP3_AWS_CloudComputing
## Alumno: Emmanuel Giménez
## Legajo: 42632
### Instrucciones

1. Crear red de Docker: 


      ```docker network create awslocal```

2. Crear un contenedor con la instancia de dynamoDB:


      ```docker run -p 8000:8000 --network awslocal --name dynamodb amazon/dynamodb-local:1.16.0 -jar DynamoDBLocal.jar -sharedDb```

3. Crear la tabla y su índice:


      Luego de ingresar a ```http://localhost:8000/shell/``` , copiar el contenido del archivo "GeneracionTablaDynamodb.txt

4. Dentro de la carpeta del proyecto, instalar las dependencias:


      ``` npm install```
      
      
5. Ejecutar la API:


      ```sam local start-api --docker-network awslocal```


### Métodos:
#### GET: 
http://127.0.0.1:3000/envios
#### POST: 
http://127.0.0.1:3000/envios/pendientes
```
Body:
{
    "destino":"Ciudad de Mendoza",
    "email":"mail@mail.com" 
}
```
#### PUT:
http://127.0.0.1:3000/envios/${id}/pendientes
