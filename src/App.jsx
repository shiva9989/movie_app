import { useState,useEffect, use } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import {updateCount,fetchTrendingMovies} from './appwrite.js'


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method : 'GET',
  headers:{
    accept : 'application/json',
    authorization : `Bearer ${API_KEY}`
  }
}

function App() {
  const [searchTerm,setSearchTerm] = useState();
  const [errorMessage,setErrorMessage] = useState('');
  const [movieList,setMovieList] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState();
  const [trendingMovies,setTrendingMovies] = useState([]);

  useDebounce(()=>{setDebouncedSearchTerm(searchTerm)},500,[searchTerm]);
  const fetchMovies = async(query = '')=>{
    setIsLoading(true);
    setErrorMessage('');
    try{
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :  `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint,API_OPTIONS);
      if(!response.ok){
        throw new Error('failed to fetch movies')
      }
      const data = await response.json();
      
      if(data.Response === 'False'){
        setErrorMessage(data.Error||'failed to fetch movies');
        setMovieList([]);
        return;
      }
      console.log(data);
      setMovieList(data.results||[]);
       
      if(query && data.results.length>0){
        await updateCount(query,data.results[0]);
      }

    }catch(err){
      console.log(err);
      setErrorMessage(err);
    }
    finally{
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async()=>{
    try{
      const result = await fetchTrendingMovies();
      setTrendingMovies(result);
      console.log(result);
    }catch(err){
      console.log(err);
    }
  }


   useEffect(()=>{
      fetchMovies(debouncedSearchTerm);
    },[debouncedSearchTerm]);

    useEffect(()=>{
      loadTrendingMovies();
    },[])


  return (
     <main>
      <div className="pattern"/>
      <div className='wrapper'>
        <header>
          <img src="src/assets/hero-img.png" alt="hero banner" />
          <h1>Find <span className='text-gradient'>Movies</span> That You'll Enjoy Without Hassle</h1>
        </header>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        {/* <h2 className='text-white'>{searchTerm}</h2> */}

        {trendingMovies.length >0 && (
          <section className="trending">
            <h2>Trending movies</h2>
            <ul>
              {trendingMovies.map((movie,index)=>(
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title}/>
                </li>
              ))}
              </ul>
          </section>
        )}
        
        <section className='all-movies'>
          <h2 className=''>All movies</h2>
          
          {isLoading?(<Spinner/>):errorMessage?<p className='text-red-500'>{errorMessage}</p>:
          <ul>
            {movieList.map((movie)=>(
            <MovieCard key={movie.id} movie={movie}/>
          ))}
          </ul>
          }
        </section>
      </div>
     </main>
    
  )
}

export default App
