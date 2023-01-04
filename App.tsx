import { StatusBar } from 'react-native'

import { ThemeProvider } from 'styled-components'
import theme from './src/theme'
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto'

import { Loading } from '@components/Loading'

import { Routes } from './src/routes'

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold })

  return (
    <ThemeProvider theme={theme}>
      <StatusBar 
        translucent
        barStyle='light-content'
        backgroundColor='transparent'
      />

      {fontsLoaded ? <Routes/> : <Loading/>}
    </ThemeProvider>
  )
}