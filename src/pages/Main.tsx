import {
    IonBadge, IonButton,
    IonButtons, IonCheckbox,
    IonContent,
    IonHeader, IonInput,
    IonItem, IonLabel,
    IonList,
    IonMenuButton, IonModal, IonNote,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import './Page.css';
import React, {useEffect, useState} from "react";
import {DataBaseManager} from "../services/DataBaseManager";
import {SQLProfessorsService} from "../services/tables/SQLProfessorsService";
import {SQLStudentService} from "../services/tables/SQLStudentService";

interface Props {
    dbManager: DataBaseManager | null;
}

const Main: React.FC<Props> = (props:Props) => {
  const [tables, setTables] = useState([] as string[]);
    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState("");
  const {dbManager} = props;
  const  name = "Main page";

  useEffect(()=>{
      if (dbManager!=null) {
          console.log("Database is ready!");
      }
  }, [dbManager]);

    const listTables = (event:any) => {
        dbManager?.listTables().then((tables: string[])=>{
            setTables(tables);
        });
    }

    const createTableUsers = (event: any) => {
        if (dbManager) {
            const db = dbManager.getDb();
            if (db) {
                const studentsService = new SQLStudentService(db);
                studentsService.createTable().then(success=> {
                    console.log("Students table created!")
                    setModalText("Students table created!");
                    setShowModal(true);
                });
            }
        }
    }

    const onSubmit = (event:any) =>{
        event.preventDefault();
        event.stopPropagation();
    }

    const createTableProfessors = (event: any) => {
        if (dbManager) {
            const db = dbManager.getDb();
            if (db) {
                const professorsService = new SQLProfessorsService(db);
                professorsService.createTable().then(success=>{
                    console.log("Professors table created!")
                    setModalText("Professors table created!");
                    setShowModal(true);
                });
            }
        }
    }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
          {
              dbManager !== null ? (
                  <form className="ion-padding" onSubmit={onSubmit}>
                      <IonItem>
                          <IonLabel position="floating">Database name</IonLabel>
                          <IonInput type="text" value={dbManager?.getName()} readonly/>
                      </IonItem>
                      <IonItem>
                          <IonLabel position="floating">Status</IonLabel>
                          <IonInput type="text" value={dbManager.getDb() ? "Success" : "Failed" } readonly />
                      </IonItem>
                      <IonButton className="ion-margin-top" expand="block" onClick={listTables}>List tables</IonButton>
                      <IonButton className="ion-margin-top" expand="block" onClick={createTableUsers}>Create table Students</IonButton>
                      <IonButton className="ion-margin-top" expand="block" onClick={createTableProfessors}>Create table Professors</IonButton>
                      <IonList>
                          {tables.map( (table, index) => <IonItem key={index}>{table}</IonItem>)}
                      </IonList>
                  </form>
              ) : (
                  <form className="ion-padding">
                      <IonItem>
                          <IonLabel>Database status</IonLabel>
                          <IonInput value="Not ready" readonly/>
                      </IonItem>
                  </form>
              )
          }
          <IonModal
              isOpen={showModal}
              swipeToClose={true}
              canDismiss={true}
          >
              <IonContent>
                  <IonHeader collapse="condense">
                      <IonToolbar>
                          <IonTitle size="large">{name}</IonTitle>
                      </IonToolbar>
                  </IonHeader>
                  <form className="ion-padding">
                      <IonItem>
                          <IonLabel>{modalText}</IonLabel>
                      </IonItem>
                      <IonButton onClick={(event) => setShowModal(false)}>Close</IonButton>
                  </form>
              </IonContent>
          </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Main;
