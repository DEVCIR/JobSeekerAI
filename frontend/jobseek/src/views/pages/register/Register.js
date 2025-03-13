import React, { useState } from 'react';
import api from '../../../services/authService';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const validateForm = () => {
    const { name, email, password } = formData;
    if (!name || !email || !password) {
      toast.warning('All fields are required!');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.warning('Enter a valid email address!');
      return false;
    }
    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters long!');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await api.post('/register', formData);
      toast.success(response.message || 'Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:5000/login/${provider}`;
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <Toaster />
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleRegister}>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Username"
                      autoComplete="username"
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      name="email"
                      placeholder="Email"
                      autoComplete="email"
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      name="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton color="success" type="submit">
                      Create Account
                    </CButton>
                  </div>

                  <hr />
                  <p className="text-center">Or register with</p>

                  <div className="d-grid gap-2">
                    <CButton color="danger" onClick={() => handleOAuthLogin('google')}>
                      Register with Google
                    </CButton>
                    <CButton color="primary" onClick={() => handleOAuthLogin('linkedin')}>
                      Register with LinkedIn
                    </CButton>
                    <CButton color="dark" onClick={() => handleOAuthLogin('github')}>
                      Register with GitHub
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Register;
