import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../auth/route';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.NODE_ENV === 'production' ? '/app/data' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'mairiehub.json');

const DEFAULT_DATA = {
  membres: ["Christian","Chantal","Sophie (DGS)","Julien","Bruno","Virginie","Francine","Mickaël","Stéphanie","Michelle","Michèle","Manuela","Daniel","Quentin","Élisabeth","Françoise","Anaïs","Amin","Sébastien","Frédéric"],
  commissions: [
    {id:1,emoji:"❤️",name:"CCAS",color:"#EC4899",description:"Centre Communal d'Action Sociale",president:"Chantal",membres:["Chantal","Virginie","Michelle","Anaïs"],prochaine:null,projets:[]},
    {id:2,emoji:"🏗️",name:"Travaux, Urbanisme, Environnement & Appel d'offre",color:"#E87A30",description:"Voirie, bâtiments, PLU, éclairage, réseaux, marchés publics",president:"Chantal",membres:["Chantal","Mickaël","Francine","Stéphanie","Bruno","Daniel","Amin"],prochaine:null,projets:[]},
    {id:3,emoji:"📚",name:"Éducation, Enfance, Jeunesse & Sports",color:"#7C3AED",description:"École, périscolaire, jeunesse, sport",president:"Bruno",membres:["Bruno","Francine","Virginie","Michèle","Mickaël","Chantal","Manuela","Daniel","Amin","Sébastien","Anaïs"],prochaine:null,projets:[]},
    {id:4,emoji:"🎭",name:"Animation, Culture, Communication & Événementiel",color:"#2d7a30",description:"Associations, culture, fêtes, communication, événements",president:"Chantal",membres:["Chantal","Virginie","Mickaël","Francine","Bruno","Élisabeth","Françoise","Sébastien"],prochaine:null,projets:[]},
    {id:5,emoji:"📡",name:"Communication, Développement économique & Informations municipal",color:"#0EA5E9",description:"Communication digitale, développement économique, bulletin municipal",president:"Virginie",membres:["Virginie","Francine","Bruno","Sébastien","Chantal"],prochaine:null,projets:[]},
    {id:6,emoji:"🌳",name:"Patrimoine & Biens indivis",color:"#16A34A",description:"Forêt, église, cimetière, biens communaux",president:"Quentin",membres:["Quentin","Élisabeth","Françoise","Virginie","Anaïs","Chantal"],prochaine:null,projets:[]},
    {id:7,emoji:"🔒",name:"Sécurité, Prévention & Salubrité publique",color:"#DC2626",description:"PCS, police du maire, salubrité, ERP",president:"Bruno",membres:["Bruno","Amin","Stéphanie","Frédéric","Manuela","Daniel","Francine","Chantal"],prochaine:null,projets:[]},
    {id:8,emoji:"💰",name:"CCID",color:"#1E5F8C",description:"Commission communale des impôts directs",president:"Chantal",membres:["Chantal","Michèle","Anaïs","Daniel","Amin"],prochaine:null,projets:[]},
    {id:9,emoji:"📋",name:"Contrôle des listes électorales",color:"#8B5CF6",description:"Vérification et mise à jour des listes électorales",president:"Manuela",membres:["Manuela"],prochaine:null,projets:[]}
  ],
  reunions: [],
  actions: [],
  agenda: []
};

function getRole() {
  const cookieStore = cookies();
  const token = cookieStore.get('mh_token')?.value;
  if (!token) return null;
  const d = verifyToken(token);
  return d?.role || null;
}

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    // First run: use defaults and save
    writeData(DEFAULT_DATA);
    return DEFAULT_DATA;
  } catch (err) { console.error(err); return DEFAULT_DATA; }
}

function writeData(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) { console.error(err); return false; }
}

export async function GET() {
  const role = getRole();
  if (!role) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const data = readData();
  if (role === 'adjoint') return NextResponse.json({ role, agenda: data.agenda || [], membres: data.membres || [] });
  return NextResponse.json({ role, ...data });
}

export async function PUT(request) {
  const role = getRole();
  if (!role) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (role === 'adjoint') return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  const body = await request.json();
  if (!writeData(body)) return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 });
  return NextResponse.json({ success: true });
}
