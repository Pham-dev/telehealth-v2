export const Uris = {
  //backendRoot : 'http://localhost:3000',
  backendRoot : '',
  token: {
    get: '/visit/token',
    validate: '/token/validate'
  },
  visits: {
    list: '/visits',
    get: '/visits/{id}',
    patientRoomToken: '/visit/room',
    patientToken: '/visit/patient-token',    
    providerRoomToken: '/visit/provider-room',
  },

  get: (endpoint: string): string => {
    return `${Uris.backendRoot}${endpoint}`;
  }
};

