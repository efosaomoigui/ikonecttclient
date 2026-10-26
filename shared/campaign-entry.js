import {mountCampaign} from './campaign.js';
// Runs after E's existing refinement has installed its portrait field.
mountCampaign({root:document.body,home:document.querySelector('.ik-home')});
