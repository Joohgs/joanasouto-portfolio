import type {MetadataRoute} from 'next';
import {profile,sectionNames} from './profile-data';
export default function sitemap():MetadataRoute.Sitemap{return sectionNames.flatMap((section,index)=>{const suffix=index===0?'':`?section=${section}`;return ['pt','en'].map(lang=>({url:`${profile.url}${lang==='en'?'/en':'/'}${suffix}`,alternates:{languages:{'pt-BR':`${profile.url}/${suffix}`,en:`${profile.url}/en${suffix}`}}}))})}
