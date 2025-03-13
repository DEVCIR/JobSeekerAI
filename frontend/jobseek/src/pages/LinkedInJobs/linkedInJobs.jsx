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
    CFormSelect,
    CFormCheck
} from '@coreui/react'
import fallbackImg from '../../../public/images/fallBackImg.jfif'

const JOBS_PER_PAGE = 100
const API_URL = 'https://linkedin-jobs-api2.p.rapidapi.com/active-jb-7d'

const LinkedInJobs = () => {
    const [jobs, setJobs] = useState([])
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState({
        title_filter: '',
        location_filter: '',
        organization_slug_filter: '',
        type_filter: 'all',
        seniority_filter: '',
        remote: 'all',
        date_filter: '',
        directapply: 'all',
        employees_lte: '',
        employees_gte: '',
        order: 'desc',
        include_ai: false,
        ai_work_arrangement_filter: '',
        ai_experience_level_filter: '',
        ai_visa_sponsorship_filter: false
    })
    const [appliedFilters, setAppliedFilters] = useState({})

    const jobTypes = ['CONTRACTOR', 'FULL_TIME', 'INTERN', 'OTHER', 'PART_TIME', 'TEMPORARY', 'VOLUNTEER']
    const seniorityOptions = ['Mid-Senior level', 'Entry level', 'Associate', 'Director', 'Executive', 'Not Applicable', 'Internship']
    const workArrangements = ['On-site', 'Hybrid', 'Remote OK', 'Remote Solely']
    const experienceLevels = ['0-2', '2-5', '5-10', '10+']

    useEffect(() => {
        const fetchJobs = async () => {
            const offset = (currentPage - 1) * JOBS_PER_PAGE
            const options = {
                method: 'GET',
                url: API_URL,
                headers: {
                    'x-rapidapi-key': 'ff14d5689dmshe6eed44cf17a699p131946jsnd9098c8bdcb0',
                    'x-rapidapi-host': 'linkedin-jobs-api2.p.rapidapi.com'
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
                .filter(([k, v]) => {
                    if (typeof v === 'string') return v !== '' && v !== 'all'
                    if (typeof v === 'boolean') return v
                    return true
                })
                .map(([k, v]) => {
                    if (k === 'remote' || k === 'directapply') {
                        if (v === 'all') return []
                        return [k, v === 'true']
                    }
                    if (k === 'include_ai' || k === 'ai_visa_sponsorship_filter') return [k, v.toString()]
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
            organization_slug_filter: '',
            type_filter: 'all',
            seniority_filter: '',
            remote: 'all',
            date_filter: '',
            directapply: 'all',
            employees_lte: '',
            employees_gte: '',
            order: 'desc',
            include_ai: false,
            ai_work_arrangement_filter: '',
            ai_experience_level_filter: '',
            ai_visa_sponsorship_filter: false
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
                        <strong>LinkedIn Job Listings</strong>
                    </CCardHeader>
                    <CCardBody>
                        {/* Filter Controls */}
                        <CRow className="mb-4 g-3">
                            {/* Basic Filters */}
                            <CCol md={3}>
                                <CFormInput
                                    placeholder="Job Title"
                                    value={filters.title_filter}
                                    onChange={(e) => handleFilterChange('title_filter', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormInput
                                    placeholder="Location"
                                    value={filters.location_filter}
                                    onChange={(e) => handleFilterChange('location_filter', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormInput
                                    placeholder="Company Slugs (comma-separated)"
                                    value={filters.organization_slug_filter}
                                    onChange={(e) => handleFilterChange('organization_slug_filter', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormSelect
                                    value={filters.type_filter}
                                    onChange={(e) => handleFilterChange('type_filter', e.target.value)}
                                >
                                    <option value="all">All Job Types</option>
                                    {jobTypes.map(type => (
                                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            {/* Seniority and Remote */}
                            <CCol md={3}>
                                <CFormInput
                                    placeholder="Seniority Levels (comma-separated)"
                                    value={filters.seniority_filter}
                                    onChange={(e) => handleFilterChange('seniority_filter', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormSelect
                                    value={filters.remote}
                                    onChange={(e) => handleFilterChange('remote', e.target.value)}
                                >
                                    <option value="all">Remote Status</option>
                                    <option value="true">Remote Only</option>
                                    <option value="false">On-site Only</option>
                                </CFormSelect>
                            </CCol>

                            {/* Date and Direct Apply */}
                            <CCol md={3}>
                                <CFormInput
                                    type="datetime-local"
                                    value={filters.date_filter}
                                    onChange={(e) => handleFilterChange('date_filter', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormSelect
                                    value={filters.directapply}
                                    onChange={(e) => handleFilterChange('directapply', e.target.value)}
                                >
                                    <option value="all">Apply Method</option>
                                    <option value="true">Easy Apply Only</option>
                                    <option value="false">Exclude Easy Apply</option>
                                </CFormSelect>
                            </CCol>

                            {/* Employees and Order */}
                            <CCol md={3}>
                                <CFormInput
                                    type="number"
                                    placeholder="Min Employees"
                                    value={filters.employees_gte}
                                    onChange={(e) => handleFilterChange('employees_gte', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormInput
                                    type="number"
                                    placeholder="Max Employees"
                                    value={filters.employees_lte}
                                    onChange={(e) => handleFilterChange('employees_lte', e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CFormSelect
                                    value={filters.order}
                                    onChange={(e) => handleFilterChange('order', e.target.value)}
                                >
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </CFormSelect>
                            </CCol>

                            {/* AI Filters */}
                            <CCol md={3}>
                                <CFormCheck
                                    label="Include AI Data"
                                    checked={filters.include_ai}
                                    onChange={(e) => handleFilterChange('include_ai', e.target.checked)}
                                />
                            </CCol>
                            {filters.include_ai && (
                                <>
                                    <CCol md={3}>
                                        <CFormInput
                                            placeholder="Work Arrangements (comma-separated)"
                                            value={filters.ai_work_arrangement_filter}
                                            onChange={(e) => handleFilterChange('ai_work_arrangement_filter', e.target.value)}
                                        />
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormInput
                                            placeholder="Experience Levels (comma-separated)"
                                            value={filters.ai_experience_level_filter}
                                            onChange={(e) => handleFilterChange('ai_experience_level_filter', e.target.value)}
                                        />
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormCheck
                                            label="Visa Sponsorship"
                                            checked={filters.ai_visa_sponsorship_filter}
                                            onChange={(e) => handleFilterChange('ai_visa_sponsorship_filter', e.target.checked)}
                                        />
                                    </CCol>
                                </>
                            )}

                            {/* Action Buttons */}
                            <CCol md={3}>
                                <CButton color="primary" onClick={handleApplyFilters} className="w-100">
                                    Apply Filters
                                </CButton>
                            </CCol>
                            <CCol md={3}>
                                <CButton color="secondary" onClick={handleResetFilters} className="w-100">
                                    Reset Filters
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

export default LinkedInJobs