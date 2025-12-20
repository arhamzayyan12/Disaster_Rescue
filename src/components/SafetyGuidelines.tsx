import React, { useState } from 'react'
import { DisasterType } from '../types'
import './SafetyGuidelines.css'

interface GuidelineSection {
    title: string
    items: string[]
}

interface DisasterGuide {
    type: DisasterType
    id: string
    icon: string
    title: string
    description: string
    before: GuidelineSection
    during: GuidelineSection
    after: GuidelineSection
}

const disasterGuides: DisasterGuide[] = [
    {
        type: 'earthquake',
        id: 'earthquake',
        icon: 'earthquake',
        title: 'Earthquake',
        description: 'Comprehensive guides for before, during, and after an earthquake.',
        before: {
            title: 'Before an Earthquake',
            items: [
                'Secure heavy furniture like bookcases and cabinets to walls.',
                'Create a disaster preparedness kit with water, non-perishable food, a first-aid kit, flashlight, and batteries.',
                'Identify safe spots in each room, such as under a sturdy table or desk.',
                'Develop and practice a family communication and evacuation plan.',
                'Know how to turn off your gas, water, and electricity.'
            ]
        },
        during: {
            title: 'During an Earthquake',
            items: [
                'Drop, Cover, and Hold On. Drop to the ground, take cover under a sturdy piece of furniture, and hold on until the shaking stops.',
                'If you are indoors, stay there. Do not run outside.',
                'Stay away from windows, glass, and anything that could fall.',
                'If you are in a vehicle, stop in a clear area away from buildings, trees, and power lines.'
            ]
        },
        after: {
            title: 'After an Earthquake',
            items: [
                'Check yourself and others for injuries. Provide first aid for anyone who needs it.',
                'Check for gas leaks, electrical damage, and water leaks. If you smell gas, open windows and leave immediately.',
                'Be prepared for aftershocks.',
                'Listen to a battery-operated radio or television for the latest emergency information.',
                'Stay out of damaged buildings.'
            ]
        }
    },
    {
        type: 'flood',
        id: 'flood',
        icon: 'flood',
        title: 'Flood',
        description: 'Safety protocols for flood warnings and evacuation.',
        before: {
            title: 'Before a Flood',
            items: [
                'Know if you live in a flood-prone area.',
                'Keep important documents in a waterproof container.',
                'Move furniture and valuables to higher floors.',
                'Prepare an emergency kit with food, water, and medications.'
            ]
        },
        during: {
            title: 'During a Flood',
            items: [
                'Evacuate immediately if told to do so.',
                'Move to higher ground.',
                'Do not drive into flooded areas. Turn around, don\'t drown.',
                'Disconnect electrical appliances if safe to do so.'
            ]
        },
        after: {
            title: 'After a Flood',
            items: [
                'Avoid floodwaters; they may be contaminated.',
                'Watch out for live wires and weakened roads.',
                'Clean and disinfect everything that got wet.',
                'Wait for official clearance before returning home.'
            ]
        }
    },
    {
        type: 'cyclone',
        id: 'cyclone',
        icon: 'cyclone',
        title: 'Cyclone',
        description: 'Precautions to take when a cyclone is approaching.',
        before: {
            title: 'Before a Cyclone',
            items: [
                'Inspect and reinforce your home (roof, windows).',
                'Trim trees and remove loose objects from outside.',
                'Stock up on emergency supplies and water.',
                'Keep a battery-powered radio handy.'
            ]
        },
        during: {
            title: 'During a Cyclone',
            items: [
                'Stay indoors and away from windows.',
                'Turn off gas and electricity supplies.',
                'Listen to official updates on the radio.',
                'If the eye passes, do not go outside; winds will resume.'
            ]
        },
        after: {
            title: 'After a Cyclone',
            items: [
                'Stay indoors until the official all-clear is given.',
                'Watch out for fallen power lines and trees.',
                'Do not enter damaged buildings.',
                'Boil tap water before drinking.'
            ]
        }
    },
    {
        type: 'fire',
        id: 'fire',
        icon: 'local_fire_department',
        title: 'Fire',
        description: 'Fire safety and prevention tips.',
        before: {
            title: 'Fire Prevention',
            items: [
                'Install smoke alarms on every level of your home.',
                'Create and practice a fire escape plan.',
                'Keep flammable items away from heat sources.',
                'Never leave cooking unattended.'
            ]
        },
        during: {
            title: 'During a Fire',
            items: [
                'Get out, stay out, and call for help.',
                'Crawl low under smoke.',
                'Test doors for heat before opening.',
                'If clothes catch fire: Stop, Drop, and Roll.'
            ]
        },
        after: {
            title: 'After a Fire',
            items: [
                'Do not re-enter until declared safe by authorities.',
                'Check for structural damage.',
                'Contact your insurance company.',
                'Discard food that may have been exposed to heat or smoke.'
            ]
        }
    }
]

const emergencyContacts = [
    { name: 'National Emergency', number: '112', icon: 'emergency', color: 'bg-primary' },
    { name: 'Ambulance', number: '108', icon: 'medical_services', color: 'bg-red-500' },
    { name: 'Fire & Rescue', number: '101', icon: 'fire_truck', color: 'bg-orange-500' },
    { name: 'Disaster Management', number: '1078', icon: 'admin_meds', color: 'bg-cyan-500' },
]

const SafetyGuidelines: React.FC = () => {
    const [selectedGuideId, setSelectedGuideId] = useState<string>('earthquake')
    const currentGuide = disasterGuides.find(g => g.id === selectedGuideId) || disasterGuides[0]

    const scrollToContacts = () => {
        document.getElementById('emergency-contacts')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="safety-layout">
            <aside className="safety-sidebar">
                <div className="sidebar-inner">
                    <div className="sidebar-header">
                        <h1>Safety Guidelines</h1>
                        <p>Disaster Preparedness</p>
                    </div>
                    <nav className="sidebar-nav">
                        {disasterGuides.map(guide => (
                            <button
                                key={guide.id}
                                className={`sidebar-link ${selectedGuideId === guide.id ? 'active' : ''}`}
                                onClick={() => setSelectedGuideId(guide.id)}
                            >
                                <span className="material-symbols-outlined">{guide.icon}</span>
                                <p>{guide.title}</p>
                            </button>
                        ))}
                        <div className="sidebar-divider"></div>
                        <button className="sidebar-link" onClick={scrollToContacts}>
                            <span className="material-symbols-outlined">contact_emergency</span>
                            <p>Emergency Contacts</p>
                        </button>
                    </nav>
                </div>
            </aside>

            <div className="safety-content">
                <div className="content-container">
                    <div className="page-header">
                        <h1>{currentGuide.title} Safety Guidelines</h1>
                        <p>{currentGuide.description}</p>
                    </div>

                    <div className="accordions">
                        {['before', 'during', 'after'].map((sectionKey) => {
                            const section = currentGuide[sectionKey as keyof Pick<DisasterGuide, 'before' | 'during' | 'after'>]
                            return (
                                <details key={sectionKey} className="accordion-group" open>
                                    <summary className="accordion-summary">
                                        <p>{section.title}</p>
                                        <span className="material-symbols-outlined accordion-indicator">expand_more</span>
                                    </summary>
                                    <div className="accordion-body">
                                        <ul>
                                            {section.items.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </details>
                            )
                        })}
                    </div>

                    <div id="emergency-contacts" className="contacts-section">
                        <div className="contacts-header">
                            <h2>National Emergency Helplines</h2>
                            <p>Key contact numbers for emergency services.</p>
                        </div>
                        <div className="contacts-grid-new">
                            {emergencyContacts.map((contact, idx) => (
                                <div key={idx} className="contact-card-new">
                                    <div className={`contact-icon-wrapper ${contact.color}`}>
                                        <span className="material-symbols-outlined">{contact.icon}</span>
                                    </div>
                                    <p className="contact-label">{contact.name}</p>
                                    <p className="contact-number-large">{contact.number}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SafetyGuidelines
