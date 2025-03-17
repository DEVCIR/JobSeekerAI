import React, { useState } from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CCard, CCardBody, CCardHeader, CCol, CRow, CFormInput, CButton, CForm } from "@coreui/react";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        lineHeight: 1.4
    },
    header: {
        marginBottom: 15,
        borderBottom: '1px solid #000',
        paddingBottom: 10
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5
    },
    section: {
        marginBottom: 15
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
        borderBottom: '1px solid #000',
        paddingBottom: 3
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: 6
    },
    dateColumn: {
        width: '20%',
        paddingRight: 10
    },
    mainColumn: {
        width: '80%'
    },
    company: {
        fontWeight: 'bold',
        marginBottom: 3
    },
    position: {
        fontStyle: 'italic',
        marginBottom: 3
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 3
    },
    bullet: {
        width: 12
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6
    },
    infoLabel: {
        width: '25%',
        fontWeight: 'bold'
    },
    infoContent: {
        width: '75%'
    }
});

const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2);
        return `${month}-${year}`;
    } catch {
        return '';
    }
};

const ResumePDF = ({ formData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.name}>{formData.personalInfo.fullName}</Text>
                <Text>e-mail: {formData.personalInfo.email}</Text>
                <Text>tel: {formData.personalInfo.phone}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Education and Qualifications</Text>
                {formData.education.map((edu, index) => (
                    <View key={index} style={styles.tableRow}>
                        <View style={styles.dateColumn}>
                            <Text>{formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}</Text>
                        </View>
                        <View style={styles.mainColumn}>
                            <Text style={styles.company}>{edu.institution}</Text>
                            <Text>{edu.location}</Text>
                            <Text>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</Text>
                            <Text>{edu.additionalInfo}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Work Experience</Text>
                {formData.workExperience.map((work, index) => (
                    <View key={index} style={styles.tableRow}>
                        <View style={styles.dateColumn}>
                            <Text>{formatDate(work.startDate)} - {work.endDate ? formatDate(work.endDate) : 'Present'}</Text>
                        </View>
                        <View style={styles.mainColumn}>
                            <Text style={styles.company}>{work.company}</Text>
                            <Text>{work.location}</Text>
                            <Text style={styles.position}>{work.position}</Text>
                            {work.description.split('\n').map((point, i) => (
                                point && (
                                    <View style={styles.bulletPoint} key={i}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text>{point}</Text>
                                    </View>
                                )
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Additional Information</Text>
                <View style={styles.infoRow}>
                    <View style={styles.infoLabel}><Text>Interests:</Text></View>
                    <View style={styles.infoContent}><Text>{formData.interests}</Text></View>
                </View>
                <View style={styles.infoRow}>
                    <View style={styles.infoLabel}><Text>Achievements:</Text></View>
                    <View style={styles.infoContent}><Text>{formData.achievements}</Text></View>
                </View>
                <View style={styles.infoRow}>
                    <View style={styles.infoLabel}><Text>Nationality:</Text></View>
                    <View style={styles.infoContent}><Text>{formData.nationality}</Text></View>
                </View>
                <View style={styles.infoRow}>
                    <View style={styles.infoLabel}><Text>Languages:</Text></View>
                    <View style={styles.infoContent}><Text>{formData.languages}</Text></View>
                </View>
            </View>
        </Page>
    </Document>
);

const CVForm = () => {
    const [formData, setFormData] = useState({
        personalInfo: {
            fullName: "",
            email: "",
            phone: "",
        },
        education: [{
            institution: "",
            location: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            additionalInfo: ""
        }],
        workExperience: [{
            company: "",
            location: "",
            position: "",
            startDate: "",
            endDate: "",
            description: ""
        }],
        interests: "",
        achievements: "",
        nationality: "",
        languages: ""
    });

    const handleInputChange = (section, field, index, value) => {
        setFormData(prev => {
            if (typeof index === 'number') {
                return {
                    ...prev,
                    [section]: Array.isArray(prev[section])
                        ? prev[section].map((item, i) =>
                            i === index ? { ...item, [field]: value } : item
                        )
                        : prev[section]
                };
            }

            if (typeof prev[section] === 'object' && !Array.isArray(prev[section])) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [field]: value
                    }
                };
            }

            return {
                ...prev,
                [section]: value
            };
        });
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, {
                institution: "",
                location: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                additionalInfo: ""
            }]
        }));
    };

    const addWorkExperience = () => {
        setFormData(prev => ({
            ...prev,
            workExperience: [...prev.workExperience, {
                company: "",
                location: "",
                position: "",
                startDate: "",
                endDate: "",
                description: ""
            }]
        }));
    };

    const handleReset = () => {
        setFormData({
            personalInfo: {
                fullName: "",
                email: "",
                phone: "",
            },
            education: [{
                institution: "",
                location: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                additionalInfo: ""
            }],
            workExperience: [{
                company: "",
                location: "",
                position: "",
                startDate: "",
                endDate: "",
                description: ""
            }],
            interests: "",
            achievements: "",
            nationality: "",
            languages: ""
        });
    };

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>CV Builder</strong>
                    </CCardHeader>
                    <CCardBody>
                        <fieldset className="mb-4">
                            <legend>Personal Information</legend>
                            <CForm>
                                <CFormInput
                                    label="Full Name"
                                    value={formData.personalInfo.fullName}
                                    onChange={(e) => handleInputChange('personalInfo', 'fullName', undefined, e.target.value)}
                                    className="mb-3"
                                />
                                <CFormInput
                                    label="Email"
                                    type="email"
                                    value={formData.personalInfo.email}
                                    onChange={(e) => handleInputChange('personalInfo', 'email', undefined, e.target.value)}
                                    className="mb-3"
                                />
                                <CFormInput
                                    label="Phone"
                                    value={formData.personalInfo.phone}
                                    onChange={(e) => handleInputChange('personalInfo', 'phone', undefined, e.target.value)}
                                    className="mb-3"
                                />
                            </CForm>
                        </fieldset>

                        <fieldset className="mb-4">
                            <legend>Education</legend>
                            {formData.education.map((edu, index) => (
                                <div key={index} className="mb-4">
                                    <CFormInput
                                        label="Institution"
                                        value={edu.institution}
                                        onChange={(e) => handleInputChange('education', 'institution', index, e.target.value)}
                                        className="mb-2"
                                    />
                                    <CFormInput
                                        label="Location"
                                        value={edu.location}
                                        onChange={(e) => handleInputChange('education', 'location', index, e.target.value)}
                                        className="mb-2"
                                    />
                                    <div className="row g-3 mb-2">
                                        <div className="col-md-6">
                                            <CFormInput
                                                label="Start Date"
                                                type="date"
                                                value={edu.startDate}
                                                onChange={(e) => handleInputChange('education', 'startDate', index, e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <CFormInput
                                                label="End Date"
                                                type="date"
                                                value={edu.endDate}
                                                onChange={(e) => handleInputChange('education', 'endDate', index, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <CFormInput
                                        label="Degree"
                                        value={edu.degree}
                                        onChange={(e) => handleInputChange('education', 'degree', index, e.target.value)}
                                        className="mb-2"
                                    />
                                    <CFormInput
                                        label="Field of Study"
                                        value={edu.fieldOfStudy}
                                        onChange={(e) => handleInputChange('education', 'fieldOfStudy', index, e.target.value)}
                                        className="mb-2"
                                    />
                                    <div className="mb-3">
                                        <label>Additional Information</label>
                                        <textarea
                                            value={edu.additionalInfo}
                                            onChange={(e) => handleInputChange('education', 'additionalInfo', index, e.target.value)}
                                            className="form-control"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            ))}
                            <CButton color="secondary" onClick={addEducation} className="mb-4">
                                Add Education
                            </CButton>
                        </fieldset>

                        <fieldset className="mb-4">
                            <legend>Work Experience</legend>
                            {formData.workExperience.map((work, index) => (
                                <div key={index} className="mb-4">
                                    <CFormInput
                                        label="Company"
                                        value={work.company}
                                        onChange={(e) => handleInputChange('workExperience', 'company', index, e.target.value)}
                                        className="mb-2"
                                    />
                                    <CFormInput
                                        label="Location"
                                        value={work.location}
                                        onChange={(e) => handleInputChange('workExperience', 'location', index, e.target.value)}
                                        className="mb-2"
                                    />
                                    <div className="row g-3 mb-2">
                                        <div className="col-md-6">
                                            <CFormInput
                                                label="Start Date"
                                                type="date"
                                                value={work.startDate}
                                                onChange={(e) => handleInputChange('workExperience', 'startDate', index, e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <CFormInput
                                                label="End Date"
                                                type="date"
                                                value={work.endDate}
                                                onChange={(e) => handleInputChange('workExperience', 'endDate', index, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <CFormInput
                                        label="Position"
                                        value={work.position}
                                        onChange={(e) => handleInputChange('workExperience', 'position', index, e.target.value)}
                                        className="mb-2"
                                    />
                                    <div className="mb-3">
                                        <label>Description (one bullet point per line)</label>
                                        <textarea
                                            value={work.description}
                                            onChange={(e) => handleInputChange('workExperience', 'description', index, e.target.value)}
                                            className="form-control"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            ))}
                            <CButton color="secondary" onClick={addWorkExperience} className="mb-4">
                                Add Work Experience
                            </CButton>
                        </fieldset>

                        <fieldset className="mb-4">
                            <legend>Additional Information</legend>
                            <div className="mb-3">
                                <label>Interests</label>
                                <textarea
                                    value={formData.interests}
                                    onChange={(e) => handleInputChange('interests', undefined, undefined, e.target.value)}
                                    className="form-control"
                                    rows={2}
                                />
                            </div>
                            <div className="mb-3">
                                <label>Achievements</label>
                                <textarea
                                    value={formData.achievements}
                                    onChange={(e) => handleInputChange('achievements', undefined, undefined, e.target.value)}
                                    className="form-control"
                                    rows={3}
                                />
                            </div>
                            <CFormInput
                                label="Nationality"
                                value={formData.nationality}
                                onChange={(e) => handleInputChange('nationality', undefined, undefined, e.target.value)}
                                className="mb-3"
                            />
                            <CFormInput
                                label="Languages"
                                value={formData.languages}
                                onChange={(e) => handleInputChange('languages', undefined, undefined, e.target.value)}
                                className="mb-3"
                            />
                        </fieldset>

                        <div className="d-flex gap-3">
                            <CButton color="danger" onClick={handleReset}>
                                Reset Form
                            </CButton>
                            <PDFDownloadLink
                                document={<ResumePDF formData={formData} />}
                                fileName="professional_cv.pdf"
                            >
                                {({ loading, onClick }) => ( 
                                    <CButton
                                        color="primary"
                                        disabled={loading}
                                        onClick={onClick} 
                                    >
                                        {loading ? 'Generating PDF...' : 'Download CV'}
                                    </CButton>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default CVForm;