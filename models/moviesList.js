const fetch = require('node-fetch')
const newList = [];
const url = 'https://api.themoviedb.org/3/movie/now_playing?api_key='
const key = process.env.API_KEY
const nowPlaying = '&language=en-US&page=1'
const movieList = () =>{
    return fetch(url+key+nowPlaying)
    .then(res=>res.json())
    .then(({results})=>{ return results.forEach((obj)=> {
        newList.push([obj.title, obj.overview, obj.poster_path]);
    }
    )})
    .catch(err=>console.log('error'))
}

movieList();

module.exports = newList;