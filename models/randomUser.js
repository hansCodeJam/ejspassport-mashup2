const fetch = require('node-fetch');
const newList = [];
const userList = () =>{
    return fetch('https://randomuser.me/api/?results=30')
    .then(res=>res.json())
    .then(({results})=>{ return results.forEach((obj)=> {
        newList.push([obj.picture.large, obj.name.first, obj.name.last]);
    })})
    .catch(err=>console.log('error'))
}

userList()

module.exports = newList;