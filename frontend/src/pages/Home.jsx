import React from 'react'
import Header from '../components/Header'
import FeaturedCourses from '../components/FeaturedCourses'

const Home = () => {
  return (
    <div  className="bg-gradient-to-br from-[#020617] to-[#0a1128]">
        <Header />
        <FeaturedCourses />
    </div>
  )
}

export default Home