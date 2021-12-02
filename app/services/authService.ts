import { PatientUser, TelehealthUser } from "../types";
import jwtDecode from "jwt-decode";
import { Uris } from "./constants";

type UserJwtToken = {    
    visitId?: string,
    role: string,
    id: string
}

function authenticateVisitorOrPatient(passcode: string): Promise<PatientUser> {
    return fetch(Uris.get(Uris.visits.token), {
        method: 'POST',
        body: JSON.stringify({ action: "TOKEN", passcode }),
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json())
    .then(tokenResp => {
        const tokenInfo = jwtDecode(tokenResp.token) as UserJwtToken;
        return {
            ...tokenInfo,
            isAuthenticated: true,
            token: tokenResp.token,
            name: tokenInfo.id
        } as PatientUser;
    });
}

function authenticatePractitioner(token: string): Promise<TelehealthUser> {
    const tokenInfo = jwtDecode(token) as UserJwtToken;
    return Promise.resolve({
      ...tokenInfo,
      isAuthenticated: true,
      token,
      name: tokenInfo.id
    } as TelehealthUser);
}

export default {
    authenticateVisitorOrPatient,
    authenticatePractitioner
};