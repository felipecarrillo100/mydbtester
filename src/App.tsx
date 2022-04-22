import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Page from './pages/Page';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Main from "./pages/Main";
import {useEffect, useState} from "react";
import {DataBaseManager} from "./services/DataBaseManager";
import {StudentsPage} from "./pages/StudentsPage";
import {ProfessorsPage} from "./pages/ProfessorsPage";
import {StudentsCreatePage} from "./pages/StudentsCreatePage";
import {ProfessorCreatePage} from "./pages/ProfessorCreatePage";

setupIonicReact();

const App: React.FC = () => {
  const [globalDBManager, setGlobalDBManager] = useState(null as DataBaseManager | null);
  useEffect(()=>{
    console.log("Will init!");
    const databaseManager = new DataBaseManager("mydb9");
    databaseManager.init().then((dbManager) => {
      if (dbManager) {
        setGlobalDBManager(dbManager)
      }
    })
    return () => {
      // Will unmount
      databaseManager.destroy();
      console.log("Will destroy!");
    }
  },[])
  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            <Route path="/" exact={true}>
              <Redirect to="/page/Database" />
            </Route>
            <Route path="/page/Database" exact={true} >
              <Main dbManager={globalDBManager}/>
            </Route>
            <Route path="/page/Students" exact={true} >
              <StudentsPage dbManager={globalDBManager}/>
            </Route>
            <Route path="/page/StudentCreate" exact={true} >
              <StudentsCreatePage dbManager={globalDBManager} key="exact"/>
            </Route>
            <Route path="/page/StudentCreate/:id" exact={true} >
              <StudentsCreatePage dbManager={globalDBManager} key="withid"/>
            </Route>
            <Route path="/page/Professors" exact={true} >
              <ProfessorsPage dbManager={globalDBManager}/>
            </Route>
            <Route path="/page/ProfessorCreate" exact={true} >
              <ProfessorCreatePage dbManager={globalDBManager} key="exact2"/>
            </Route>
            <Route path="/page/ProfessorCreate/:id" exact={true} >
              <ProfessorCreatePage dbManager={globalDBManager} key="withid2"/>
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
