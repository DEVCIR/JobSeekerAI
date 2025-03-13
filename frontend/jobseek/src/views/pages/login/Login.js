import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cibGoogle, cibLinkedin, cibGithub } from '@coreui/icons'
import api from '../../../services/api'
import "react-toastify/dist/ReactToastify.css";
import { toast, Toaster } from "sonner";

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await api.post('/login', {
        email,
        password
      })

      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = (provider) => {
    window.location.href = `http://localhost:5000/login/${provider}`
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <Toaster />
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    
                    {error && <CAlert color="danger">{error}</CAlert>}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput 
                        placeholder="Email" 
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton 
                          color="primary" 
                          className="px-4" 
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'Loading...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>

                    <div className="text-center mt-4">
                      <p className="text-body-secondary">Or continue with</p>
                      <div className="d-flex gap-2 justify-content-center">
                        <CButton 
                          color="danger" 
                          onClick={() => handleOAuth('google')}
                        >
                          <CIcon icon={cibGoogle} className="me-2" />
                          Google
                        </CButton>
                        <CButton 
                          color="primary" 
                          onClick={() => handleOAuth('linkedin')}
                        >
                          <CIcon icon={cibLinkedin} className="me-2" />
                          LinkedIn
                        </CButton>
                        <CButton 
                          color="dark" 
                          onClick={() => handleOAuth('github')}
                        >
                          <CIcon icon={cibGithub} className="me-2" />
                          GitHub
                        </CButton>
                      </div>
                    </div>
                  </CForm>
                </CCardBody>
              </CCard>

              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Create a new account to access all features of our platform.
                    </p>
                    <Link to="/register">
                      <CButton color="light" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login