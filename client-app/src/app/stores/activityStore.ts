import {observable, action, computed, configure, runInAction} from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

configure({enforceActions: 'always'})

class ActivityStore {
  
  @observable activitiesRegistry = new Map();
  @observable activity: IActivity | null = null;
  @observable loadingInitial = false;        
  @observable submitting = false;
  @observable target = '';

  @computed get activitiesByDate() {
    return Array.from(this.activitiesRegistry.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
  }

  @action loadActivities = async () => {        
      this.loadingInitial = true;               
      try{
        const activities  = await agent.Activities.list();        
        runInAction('loading activities', () => {
          activities.forEach(activity => {
            activity.date = activity.date.split(".")[0];
            this.activitiesRegistry.set(activity.id, activity);
          });
          this.loadingInitial = false;          
        })
      }
      catch(error) {
        runInAction('load activities error', () => {
          console.log(error);
          this.loadingInitial = false;
        })
      }      
  }

  @action loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if(activity) {
      this.activity = activity
    } 
    else {
      this.loadingInitial = true;               
      try {
        activity = await agent.Activities.details(id);
        runInAction('getting activity', () => {
        this.activity = activity;
        this.loadingInitial = false;
        })
      }
      catch(error) {
        runInAction('get activity error', () => {
          this.loadingInitial = false;
        })
        console.log(error);
      }      
    }
  }

  @action clearActivity = async() => {
    this.activity = null;
  }

  getActivity = (id: string) => {
    return this.activitiesRegistry.get(id);
  }


  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      agent.Activities.create(activity);
      runInAction('creating activity', () => { 
        this.activitiesRegistry.set(activity.id, activity);
        this.submitting = false;        
      })
    }
    catch(error) {
      runInAction('create activity error', () => { 
        console.log(error);
        this.submitting = false;
      })
    }
  }

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;        
    try {
      await agent.Activities.update(activity);
      runInAction('editing activity', () => {
        this.activitiesRegistry.set(activity.id, activity)
        this.activity = activity;
        this.submitting = false;
      })
    }
    catch (error) {      
      runInAction('edit activty error', () => {
        this.submitting = false;
        console.log(error);        
      })
    }
  }

  @action deleteActivity = async(event: SyntheticEvent<HTMLButtonElement>, id: string) => {    
    this.submitting = true;        
    this.target = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      runInAction('deleting activity', () => { 
        this.activitiesRegistry.delete(id);
        this.submitting = false;
        this.target = '';
      })
    }
    catch(error) {
      runInAction('delete activity error', () => { 
        this.submitting = false;
        this.target = '';
        console.log(error);        
      })
    }
  }
}

export default createContext(new ActivityStore())