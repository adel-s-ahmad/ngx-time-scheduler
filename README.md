# lear to create angular npm library

1- create a new workspace: ng new <application-name> --create-application=false
2- Generate library: ng generate library <library-name> 
3- build the library: ng build <library-name> 
4- packaging the library: cd dist/<library-name> && npm pack  --> generates .tgz file inside the dist/<library-name> folder
5- install the library in a project: npm install <path-to-tgz-file>
6- import the module of the library to the target project module
7- to publish the library on npm: 
  7.1- login to npm: npm login -> and verify using: npm whoami
  7.2- npm publish <path-to-tgz-file> --access public
  7.3- now anyone can use the library using: npm i <library-name> 
