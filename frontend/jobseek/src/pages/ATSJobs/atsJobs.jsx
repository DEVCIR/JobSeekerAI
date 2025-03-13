import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableRow,
    CButton,
    CPagination,
    CPaginationItem,
    CFormInput,
    CFormSelect
} from '@coreui/react'
import fallbackImg from '../../../public/images/fallBackImg.jfif'

const JOBS_PER_PAGE = 100
const API_URL = 'https://active-jobs-db.p.rapidapi.com/active-ats-7d'

const AtsJobs = () => {
    const [jobs, setJobs] = useState([])
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState({
        title_filter: '',
        location_filter: '',
        organization_filter: '',
        source: 'all',
        remote: 'all',
        date_filter: '',
        salary_unit: 'all',
        min_salary: '',
        max_salary: '',
        include_ai: false,
        ai_employment_type_filter: '',
        ai_work_arrangement_filter: '',
        ai_experience_level_filter: '',
        ai_visa_sponsorship_filter: false,
        description_type: 'all'
    })
    const [appliedFilters, setAppliedFilters] = useState({})

    const sources = [
        'ashby', 'bamboohr', 'breezy', 'careerplug', 'dayforce', 'eightfold',
        'greenhouse', 'hiringthing', 'icims', 'jobvite', 'join.com', 'lever.co',
        'oraclecloud', 'paycom', 'paylocity', 'personio', 'phenompeople', 'pinpoint',
        'recruitee', 'smartrecruiters', 'successfactors', 'teamtailor', 'workable',
        'workday', 'zoho'
    ]

    useEffect(() => {
        const fetchJobs = async () => {
            const offset = (currentPage - 1) * JOBS_PER_PAGE
            const options = {
                method: 'GET',
                url: API_URL,
                headers: {
                    'x-rapidapi-key': 'ff14d5689dmshe6eed44cf17a699p131946jsnd9098c8bdcb0',
                    'x-rapidapi-host': 'active-jobs-db.p.rapidapi.com'
                },
                params: {
                    limit: JOBS_PER_PAGE,
                    offset: offset,
                    ...appliedFilters
                }
            }

            try {
                setIsLoading(true)
                const response = await axios.request(options)
                setJobs(response.data)
                setError(null)
            } catch (error) {
                setError(error.message)
                setJobs([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchJobs()
    }, [currentPage, appliedFilters])

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const handleApplyFilters = () => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters)
                .filter(([_, v]) => {
                    if (typeof v === 'string') return v !== '' && v !== 'all'
                    return v !== false
                })
                .map(([k, v]) => {
                    if (k === 'remote') {
                        if (v === 'remote') return [k, true]
                        if (v === 'onsite') return [k, false]
                        return []
                    }
                    if (k === 'include_ai') return [k, v ? 'true' : 'false']
                    if (k === 'ai_visa_sponsorship_filter') return [k, v ? 'true' : 'false']
                    return [k, v]
                })
                .filter(([k, v]) => v !== undefined)
        )

        setAppliedFilters(cleanFilters)
        setCurrentPage(1)
    }

    const handleResetFilters = () => {
        setFilters({
            title_filter: '',
            location_filter: '',
            organization_filter: '',
            source: 'all',
            remote: 'all',
            date_filter: '',
            salary_unit: 'all',
            min_salary: '',
            max_salary: '',
            include_ai: false,
            ai_employment_type_filter: '',
            ai_work_arrangement_filter: '',
            ai_experience_level_filter: '',
            ai_visa_sponsorship_filter: false,
            description_type: 'all'
        })
        setAppliedFilters({})
        setCurrentPage(1)
    }

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1))
    }

    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1)
    }

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
        return diff === 0 ? 'Posted Today' : `${diff} days ago`
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Job Listings</strong>
                    </CCardHeader>
                    <CCardBody>
                        {/* Filter Controls */}
                        <CRow className="mb-4 g-3">
                            <CCol md={3}>
                                <CFormInput
                                    placeholder="Title filter (e.g., 'Software Engineer')"
                                    value={filters.title_filter}
                                    onChange={(e) => handleFilterChange('title_filter', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormInput
                                    placeholder="Location filter (e.g., 'United States')"
                                    value={filters.location_filter}
                                    onChange={(e) => handleFilterChange('location_filter', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormInput
                                    placeholder="Company filter (comma-separated)"
                                    value={filters.organization_filter}
                                    onChange={(e) => handleFilterChange('organization_filter', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormSelect
                                    value={filters.source}
                                    onChange={(e) => handleFilterChange('source', e.target.value)}
                                >
                                    <option value="all">All Sources</option>
                                    {sources.map(source => (
                                        <option key={source} value={source}>{source}</option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            <CCol md={2}>
                                <CFormSelect
                                    value={filters.remote}
                                    onChange={(e) => handleFilterChange('remote', e.target.value)}
                                >
                                    <option value="all">All Locations</option>
                                    <option value="remote">Remote Only</option>
                                    <option value="onsite">On-site Only</option>
                                </CFormSelect>
                            </CCol>

                            <CCol md={2}>
                                <CFormInput
                                    type="datetime-local"
                                    placeholder="Date Filter"
                                    value={filters.date_filter}
                                    onChange={(e) => handleFilterChange('date_filter', e.target.value)}
                                />
                            </CCol>

                            <CCol md={2}>
                                <CFormSelect
                                    value={filters.salary_unit}
                                    onChange={(e) => handleFilterChange('salary_unit', e.target.value)}
                                >
                                    <option value="all">Salary Type</option>
                                    <option value="HOUR">Hourly</option>
                                    <option value="YEAR">Yearly</option>
                                    <option value="MONTH">Monthly</option>
                                </CFormSelect>
                            </CCol>

                            {filters.salary_unit !== 'all' && (
                                <>
                                    <CCol md={2}>
                                        <CFormInput
                                            type="number"
                                            placeholder="Min Salary"
                                            value={filters.min_salary}
                                            onChange={(e) => handleFilterChange('min_salary', e.target.value)}
                                        />
                                    </CCol>
                                    <CCol md={2}>
                                        <CFormInput
                                            type="number"
                                            placeholder="Max Salary"
                                            value={filters.max_salary}
                                            onChange={(e) => handleFilterChange('max_salary', e.target.value)}
                                        />
                                    </CCol>
                                </>
                            )}

                            <CCol md={2}>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={filters.include_ai}
                                        onChange={(e) => handleFilterChange('include_ai', e.target.checked)}
                                    />
                                    <label className="form-check-label">Include AI Data</label>
                                </div>
                            </CCol>

                            <CCol md={2}>
                                <CFormInput
                                    placeholder="Employment Types (comma-separated)"
                                    value={filters.ai_employment_type_filter}
                                    onChange={(e) => handleFilterChange('ai_employment_type_filter', e.target.value)}
                                />
                            </CCol>

                            <CCol md={2}>
                                <CFormInput
                                    placeholder="Work Arrangements (comma-separated)"
                                    value={filters.ai_work_arrangement_filter}
                                    onChange={(e) => handleFilterChange('ai_work_arrangement_filter', e.target.value)}
                                />
                            </CCol>

                            <CCol md={2}>
                                <CFormInput
                                    placeholder="Experience Levels (comma-separated)"
                                    value={filters.ai_experience_level_filter}
                                    onChange={(e) => handleFilterChange('ai_experience_level_filter', e.target.value)}
                                />
                            </CCol>

                            <CCol md={2}>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={filters.ai_visa_sponsorship_filter}
                                        onChange={(e) => handleFilterChange('ai_visa_sponsorship_filter', e.target.checked)}
                                    />
                                    <label className="form-check-label">Visa Sponsorship</label>
                                </div>
                            </CCol>

                            <CCol md={2}>
                                <CFormSelect
                                    value={filters.description_type}
                                    onChange={(e) => handleFilterChange('description_type', e.target.value)}
                                >
                                    <option value="all">No Description</option>
                                    <option value="text">Text Description</option>
                                    <option value="html">HTML Description</option>
                                </CFormSelect>
                            </CCol>

                            <CCol md={2}>
                                <CButton color="primary" onClick={handleApplyFilters} className="w-100">
                                    Apply Filters
                                </CButton>
                            </CCol>
                            <CCol md={2}>
                                <CButton color="secondary" onClick={handleResetFilters} className="w-100">
                                    Reset
                                </CButton>
                            </CCol>
                        </CRow>

                        {/* Loading and error states */}
                        {isLoading && <div className="text-center">Loading jobs...</div>}
                        {error && <div className="text-danger mb-3">Error: {error}</div>}

                        {/* Jobs Table */}
                        {!isLoading && !error && (
                            <>
                                <CTable borderless responsive>
                                    <CTableBody>
                                        {jobs.map((job) => (
                                            <CTableRow key={job.id} className="py-3 align-middle">
                                                <CTableDataCell>
                                                    <div className="d-flex align-items-center" style={{ gap: '20px', padding: '10px 0' }}>
                                                        <img
                                                            src={job.organization_logo || fallbackImg}
                                                            alt={job.organization}
                                                            className="rounded"
                                                            style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                                                        />
                                                        <div className="flex-grow-1">
                                                            <h5 className="mb-1">
                                                                <a href={job.url} className="text-decoration-none text-primary">
                                                                    {job.title}
                                                                </a>
                                                            </h5>
                                                            <div className="mb-2">
                                                                <span className="fw-bold">{job.organization}</span>
                                                                {!job.remote_derived && ' - On-site'}
                                                            </div>
                                                            <div className="text-muted">
                                                                <span className="d-block">{job.locations_derived?.join(', ')}</span>
                                                                {job.salary_raw?.value && (
                                                                    <span>
                                                                        Salary: ${(job.salary_raw.value.minValue || 0).toLocaleString()} - $
                                                                        {(job.salary_raw.value.maxValue || 0).toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <small className="text-muted">{getTimeAgo(job.date_posted)}</small>
                                                        </div>
                                                        <CButton
                                                            color="primary"
                                                            href={job.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="align-self-start"
                                                        >
                                                            Apply
                                                        </CButton>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>

                                {/* Pagination */}
                                <CPagination className="mt-4 justify-content-center">
                                    <CPaginationItem
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </CPaginationItem>
                                    <CPaginationItem active>{currentPage}</CPaginationItem>
                                    <CPaginationItem
                                        onClick={handleNextPage}
                                        disabled={jobs.length < JOBS_PER_PAGE}
                                    >
                                        Next
                                    </CPaginationItem>
                                </CPagination>
                            </>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default AtsJobs