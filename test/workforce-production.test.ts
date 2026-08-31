import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  app,
  consultantProfilesDb,
  consultantSettingsDb,
  workforceApplicationsDb,
} from '../server';
import { VIRTUAL_PROFILES } from '../src/data/virtualProfiles';

describe('Gestão de profissionais em produção', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    Object.keys(workforceApplicationsDb).forEach((key) => delete workforceApplicationsDb[key]);
    Object.keys(consultantProfilesDb).forEach((key) => delete consultantProfilesDb[key]);
    Object.keys(consultantSettingsDb).forEach((key) => delete consultantSettingsDb[key]);
  });

  it('recebe candidatura, permite aprovação administrativa e publica no marketplace', async () => {
    const application = await request(app)
      .post('/api/work-with-us/applications')
      .send({
        fullName: 'Maria das Estrelas',
        professionalName: 'Mestra Estrela Dourada',
        email: 'estrela@example.com',
        phone: '11999999999',
        city: 'São Paulo',
        state: 'SP',
        bio: 'Profissional com experiência responsável em Tarot e orientação espiritual.',
        experienceYears: 8,
        specialties: ['tarot'],
        oracles: ['tarot'],
        languages: ['Português'],
        modality: 'chat',
        termsAccepted: true,
      });

    expect(application.status).toBe(201);
    const id = application.body.data.id;

    const approval = await request(app)
      .patch(`/api/admin/workforce-applications/${id}`)
      .set('x-user-id', 'usr-admin-1')
      .send({ status: 'approved', pricePerMinute: 4.5 });

    expect(approval.status).toBe(200);

    const marketplace = await request(app).get('/api/consultants/public');
    expect(marketplace.status).toBe(200);
    expect(marketplace.body.data.approved).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Mestra Estrela Dourada',
          pricePerMinute: 4.5,
          active: true,
        }),
      ]),
    );
  });

  it('permite somente ao administrador alterar o valor por minuto', async () => {
    const forbidden = await request(app)
      .patch('/api/admin/consultants/ai_c1/pricing')
      .set('x-user-id', 'usr-client-1')
      .send({ pricePerMinute: 6 });
    expect(forbidden.status).toBe(403);

    const approved = await request(app)
      .patch('/api/admin/consultants/ai_c1/pricing')
      .set('x-user-id', 'usr-admin-1')
      .send({ pricePerMinute: 6 });
    expect(approved.status).toBe(200);
    expect(consultantSettingsDb.ai_c1.pricePerMinute).toBe(6);
  });

  it('usa uma imagem espiritual local e exclusiva para cada atendente de IA', () => {
    const avatars = VIRTUAL_PROFILES.map((profile) => profile.avatar);
    expect(new Set(avatars).size).toBe(VIRTUAL_PROFILES.length);
    expect(avatars.every((avatar) => avatar.startsWith('/consultants/'))).toBe(true);
  });
});
