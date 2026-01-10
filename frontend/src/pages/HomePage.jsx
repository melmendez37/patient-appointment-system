import React, {useEffect, useState} from 'react'
import axios from 'axios'
import Spinner from '../components/Spinner'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
    </div>
  )
}

export default HomePage