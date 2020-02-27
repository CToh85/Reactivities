import React, { useState, Fragment, useEffect} from 'react';
import { Container } from 'semantic-ui-react'
import axios from 'axios';
import { IActivity } from '../models/activity';
import NavBar from '../../features/nav/NavBar';
import ActivitiesDashboard from '../../features/activities/dashboard/ActivityDashboard';

const App = () => {

    // so here you are looking at [nameOfVarialbe, theMethodToGetIt]
    const [activities, setActivities] = useState<IActivity[]>([]);    
    const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
    const [editMode, setEditMode] = useState(false);

    const handleOpenCreateForm  = () => {
        setSelectedActivity(null);
        setEditMode(true);
    }

    const handleSelectActivity = (id: string) => {
        setSelectedActivity(activities.filter(a => a.id === id)[0]);
        setEditMode(false);
    }

    const handleCreateActivity = (activity : IActivity) => {
        setActivities([...activities, activity]);
        setSelectedActivity(activity);
        setEditMode(false);
    }

    const handleEditActivity =(activity : IActivity) => {
        // so this is not finding one and updating it. the ... syntax is a spread and making a new array but not including the one with 
        // the matching ID we have updated in our activity. Then it is just adding our new acitvity.
        setActivities([...activities.filter(a => a.id !== activity.id), activity])   
        setSelectedActivity(activity);
        setEditMode(false);
    }

    const handleDeleteActivity = (id: string) => {
        setActivities([...activities.filter(a => a.id !== id)]);
    }


    useEffect(() => {
        axios
        .get<IActivity[]>('http://localhost:5000/api/activities')
        .then((response) => {
            let activities : IActivity[] = [];
            response.data.forEach(activity => {
                activity.date = activity.date.split('.')[0];
                activities.push(activity);
            })

            setActivities(activities);
            });
    }, []); 

    return (
        <Fragment>
            <NavBar openCreateForm={handleOpenCreateForm} />
            <Container style={{marginTop: '7em'}}>
                <ActivitiesDashboard 
                // sending everything through to the dashboard.
                activities={activities} 
                selectActivity={handleSelectActivity}
                selectedActivity={selectedActivity!}
                editMode={editMode}                     
                setEditMode={setEditMode}
                setSelectedActivity={setSelectedActivity}
                createActivity={handleCreateActivity}
                editActivity={handleEditActivity}
                deleteActivity={handleDeleteActivity}
                />
            </Container>
        </Fragment>
    );
}

export default App;