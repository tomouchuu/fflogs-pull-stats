import React from 'react'
import ReactDOM from 'react-dom'
import { createClient, Provider } from 'urql'

import './index.css'
import App from './App'
import PullsOnly from './Pulls-Only';

const client = createClient({
  url: 'https://www.fflogs.com/api/v2/user',
  fetchOptions: () => {
    const token = import.meta.env.VITE_FFLOGS_API_TOKEN;
    return {
      headers: { authorization: token ? `Bearer ${token}` : '' },
    };
  }
});

ReactDOM.render(
  <React.StrictMode>
    <Provider value={client}>
      <PullsOnly />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
