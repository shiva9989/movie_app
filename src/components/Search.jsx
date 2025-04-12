import React from 'react'

const Search = ({searchTerm,setSearchTerm}) => {
  return (
    <div className='search'>
        <div>
        <img src="src/assets/search.svg" alt="" />
        <input 
        placeholder='search movies...'
        type="text"
        value={searchTerm}
        onChange = {(e)=>{setSearchTerm(e.target.value)}}
        />
        </div>
       

    </div>
  )
}

export default Search
