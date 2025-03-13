import React, { useState, useEffect } from 'react'
import axios from 'axios';
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
} from '@coreui/react'
import fallbackImg from '../../../../public/images/fallBackImg.jfif'

const CACHE_EXPIRY_TIME = 3600000; // 1 hour in milliseconds

const Tables = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const options = {
        method: 'GET',
        url: 'https://active-jobs-db.p.rapidapi.com/active-ats-7d',
        // params: {
        //   title_filter: '"Data Engineer"',
        //   location_filter: '"United States"'
        // },
        headers: {
          'x-rapidapi-key': '9e9df16975msh88b0e4d59f4d237p165976jsn4ba47dd7e41b',
          'x-rapidapi-host': 'active-jobs-db.p.rapidapi.com'
        }
      };

      try {
        // Check cache first
        const cachedData = localStorage.getItem('jobsData');
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME;

          if (!isExpired) {
            setJobs(data);
            setIsLoading(false);
            return;
          }
        }

        // Fetch new data if cache is expired or doesn't exist
        const response = await axios.request(options);
        setJobs(response.data);
        setIsLoading(false);

        // Update cache
        localStorage.setItem('jobsData', JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
        console.error(error);
      }
    };

    fetchJobs();
  }, []);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Posted Today' : `${diff} days ago`;
  };

  if (error) {
    return <div>Error fetching jobs: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Job Listings</strong>
          </CCardHeader>
          <CCardBody>
            <CTable borderless responsive>
              <CTableBody>
                {jobs.map((job) => (
                  <CTableRow key={job.id} className="py-3 align-middle">
                    <CTableDataCell className="w-25">
                      <CRow className="align-items-center" style={{ borderBottom:'2px Solid gray' }}>
                        <div style={{ display: 'flex', gap:'20px', padding:10 }}>
                          <img
                            src={job.organization_logo || fallbackImg}
                            alt={job.organization}
                            className="rounded"
                            style={{ width: '100px', height: '100px', objectFit: 'contain', backgroundColor: 'white' }} />
                          <CCol xs={20}>
                            <div className="mb-2">
                              <a href={job.url} className="text-decoration-none">
                                <strong className="text-primary"  style={{ fontSize:'20px' }}>{job.title}</strong>
                              </a>
                            </div>
                            <div style={{ display: 'flex', flexDirection:'column' }}>
                              <span style={{ fontSize:'15px' }}>{job.organization} - {!job.remote_derived && ' (On-site)'}</span>
                              <span style={{ fontSize:'14px' }}>{job.locations_derived?.join(', ')}</span>
                            </div>
                            <div className="text-muted small">
                              <span>{getTimeAgo(job.date_created)}</span>
                            </div>
                          </CCol>
                        </div>
                      </CRow>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Tables

{/* <CCol xs={12}>
<DocsComponents href="components/table/" />
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Basic example</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      Using the most basic table CoreUI, here&#39;s how <code>&lt;CTable&gt;</code>-based
      tables look in CoreUI.
    </p>
    <DocsExample href="components/table">
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Variants</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      Use contextual classes to color tables, table rows or individual cells.
    </p>
    <DocsExample href="components/table#variants">
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">Default</CTableHeaderCell>
            <CTableDataCell>Cell</CTableDataCell>
            <CTableDataCell>Cell</CTableDataCell>
          </CTableRow>
          <CTableRow color="primary">
            <CTableHeaderCell scope="row">Primary</CTableHeaderCell>
            <CTableDataCell>Cell</CTableDataCell>
            <CTableDataCell>Cell</CTableDataCell>
          </CTableRow>
          <CTableRow color="secondary">
            <CTableHeaderCell scope="row">Secondary</CTableHeaderCell>
            <CTableDataCell>Cell</CTableDataCell>
            <CTableDataCell>Cell</CTableDataCell>
          </CTableRow>
          <CTableRow color="success">
            <CTableHeaderCell scope="row">Success</CTableHeaderCell>
            <CTableDataCell>Cell</CTableDataCell>
            <CTableDataCell>Cell</CTableDataCell>
          </CTableRow>
          <CTableRow color="danger">
            <CTableHeaderCell scope="row">Danger</CTableHeaderCell>
            <CTableDataCell>Cell</CTableDataCell>
            <CTableDataCell>Cell</CTableDataCell>
          </CTableRow>
          <CTableRow color="warning">
            <CTableHeaderCell scope="row">Warning</CTableHeaderCell>
            <CTableDataCell>Cell</CTableDataCell>
            <CTableDataCell>Cell</CTableDataCell>
          </CTableRow>
          <CTableRow color="info">
            <CTableHeaderCell scope="row">Info</CTableHeaderCell>
            <CTableDataCell>Cell</CTableDataCell>
            <CTableDataCell>Cell</CTableDataCell>
          </CTableRow>
          <CTableRow color="light">
            <CTableHeaderCell scope="row">Light</CTableHeaderCell>
            <CTableDataCell>Cell</CTableDataCell>
            <CTableDataCell>Cell</CTableDataCell>
          </CTableRow>
          <CTableRow color="dark">
            <CTableHeaderCell scope="row">Dark</CTableHeaderCell>
            <CTableDataCell>Cell</CTableDataCell>
            <CTableDataCell>Cell</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Striped rows</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      Use <code>striped</code> property to add zebra-striping to any table row within the{' '}
      <code>&lt;CTableBody&gt;</code>.
    </p>
    <DocsExample href="components/table#striped-rows">
      <CTable striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
    <p className="text-body-secondary small">
      These classes can also be added to table variants:
    </p>
    <DocsExample href="components/table#striped-rows">
      <CTable color="dark" striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
    <DocsExample href="components/table#striped-rows">
      <CTable color="success" striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Hoverable rows</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      Use <code>hover</code> property to enable a hover state on table rows within a{' '}
      <code>&lt;CTableBody&gt;</code>.
    </p>
    <DocsExample href="components/table#hoverable-rows">
      <CTable hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
    <DocsExample href="components/table#hoverable-rows">
      <CTable color="dark" hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
    <DocsExample href="components/table#hoverable-rows">
      <CTable striped hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Active tables</small>
  </CCardHeader>
  <CCardBody>
    <DocsExample href="components/table#active-tables">
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow active>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2} active>
              Larry the Bird
            </CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
    <DocsExample href="components/table#active-tables">
      <CTable color="dark">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow active>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2} active>
              Larry the Bird
            </CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Bordered tables</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      Add <code>bordered</code> property for borders on all sides of the table and cells.
    </p>
    <DocsExample href="components/table#bordered-tables">
      <CTable bordered>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
    <p className="text-body-secondary small">
      <a href="https://coreui.io/docs/utilities/borders#border-color">
        Border color utilities
      </a>{' '}
      can be added to change colors:
    </p>
    <DocsExample href="components/table#bordered-tables">
      <CTable bordered borderColor="primary">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Tables without borders</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      Add <code>borderless</code> property for a table without borders.
    </p>
    <DocsExample href="components/table#tables-without-borders">
      <CTable borderless>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
    <DocsExample href="components/table#tables-without-borders">
      <CTable color="dark" borderless>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Small tables</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      Add <code>small</code> property to make any <code>&lt;CTable&gt;</code> more compact
      by cutting all cell <code>padding</code> in half.
    </p>
    <DocsExample href="components/table#small-tables">
      <CTable small>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>*/}

{/* <CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Nesting</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      Border styles, active styles, and table variants are not inherited by nested tables.
    </p>
    <DocsExample href="components/table#nesting">
      <CTable striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell colSpan={4}>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Header</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Header</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Header</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow>
                    <CTableHeaderCell scope="row">A</CTableHeaderCell>
                    <CTableDataCell>First</CTableDataCell>
                    <CTableDataCell>Last</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell scope="row">B</CTableHeaderCell>
                    <CTableDataCell>First</CTableDataCell>
                    <CTableDataCell>Last</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell scope="row">C</CTableHeaderCell>
                    <CTableDataCell>First</CTableDataCell>
                    <CTableDataCell>Last</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </CTableHeaderCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Table head</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      Similar to tables and dark tables, use the modifier prop{' '}
      <code>color=&#34;light&#34;</code> or <code>color=&#34;dark&#34;</code> to make{' '}
      <code>&lt;CTableHead&gt;</code>s appear light or dark gray.
    </p>
    <DocsExample href="components/table#table-head">
      <CTable>
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell>Larry</CTableDataCell>
            <CTableDataCell>the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
    <DocsExample href="components/table#table-head">
      <CTable>
        <CTableHead color="dark">
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Table foot</small>
  </CCardHeader>
  <CCardBody>
    <DocsExample href="components/table#table-foot">
      <CTable>
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
        <CTableHead>
          <CTableRow>
            <CTableDataCell>Footer</CTableDataCell>
            <CTableDataCell>Footer</CTableDataCell>
            <CTableDataCell>Footer</CTableDataCell>
            <CTableDataCell>Footer</CTableDataCell>
          </CTableRow>
        </CTableHead>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol>
<CCol xs={12}>
<CCard className="mb-4">
  <CCardHeader>
    <strong>React Table</strong> <small>Captions</small>
  </CCardHeader>
  <CCardBody>
    <p className="text-body-secondary small">
      A <code>&lt;CTableCaption&gt;</code> functions like a heading for a table. It helps
      users with screen readers to find a table and understand what it&#39;s about and
      decide if they want to read it.
    </p>
    <DocsExample href="components/table#captions">
      <CTable>
        <CTableCaption>List of users</CTableCaption>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell>Larry</CTableDataCell>
            <CTableDataCell>the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
    <p className="text-body-secondary small">
      You can also put the <code>&lt;CTableCaption&gt;</code> on the top of the table with{' '}
      <code>caption=&#34;top&#34;</code>.
    </p>
    <DocsExample href="components/table#captions">
      <CTable caption="top">
        <CTableCaption>List of users</CTableCaption>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
            <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow>
            <CTableHeaderCell scope="row">1</CTableHeaderCell>
            <CTableDataCell>Mark</CTableDataCell>
            <CTableDataCell>Otto</CTableDataCell>
            <CTableDataCell>@mdo</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">2</CTableHeaderCell>
            <CTableDataCell>Jacob</CTableDataCell>
            <CTableDataCell>Thornton</CTableDataCell>
            <CTableDataCell>@fat</CTableDataCell>
          </CTableRow>
          <CTableRow>
            <CTableHeaderCell scope="row">3</CTableHeaderCell>
            <CTableDataCell>Larry</CTableDataCell>
            <CTableDataCell>the Bird</CTableDataCell>
            <CTableDataCell>@twitter</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </DocsExample>
  </CCardBody>
</CCard>
</CCol> */}