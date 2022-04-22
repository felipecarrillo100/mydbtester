import {
    IonAvatar,
    IonButton,
    IonButtons, IonCheckbox,
    IonContent,
    IonHeader, IonInput,
    IonItem, IonLabel,
    IonList,
    IonMenuButton, IonModal, IonNote,
    IonPage,
    IonTitle,
    IonToolbar, useIonActionSheet
} from '@ionic/react';
import './Page.css';
import React, {useEffect, useState} from "react";
import {DataBaseManager} from "../services/DataBaseManager";
import {useHistory} from "react-router-dom";
import {Professor, SQLProfessorsService} from "../services/tables/SQLProfessorsService";

interface Props {
    dbManager: DataBaseManager | null;
}

const ProfessorsPage: React.FC<Props> = (props:Props) => {
    const history = useHistory();

    const [searchText, setSearchText] = useState("");
    const [present, dismiss] = useIonActionSheet();

    const [students, setStudents] = useState([] as Professor[]);
    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState("");
    const {dbManager} = props;
    const  name = "Professors";

    const loadEntries = () => {
        if (dbManager!=null) {
            console.log("Database is ready!");
            const db = dbManager.getDb();
            if (db) {
                const studentService = new SQLProfessorsService(db);
                studentService.list({
                    search: searchText,
                    limit:100,
                    offset:0,
                    asc: true
                }).then((queryResults) => {
                    console.log(queryResults);
                    setStudents(queryResults.items);
                })
            }
        }
    }

    const deleteAction = (student: Professor) => () =>{
        if (dbManager!=null) {
            const db = dbManager.getDb();
            if (db && typeof student.id !== "undefined") {
                const studentService = new SQLProfessorsService(db);
                studentService.delete(student.id).then((success) => {
                    if (success) {
                        console.log("Deleted " + student.id);
                        loadEntries();
                    }
                })
            }
        }
    }

    const editAction = (professor: Professor) => () =>{
        console.log(professor)
        if (professor && professor.id) {
            const page = '/page/ProfessorCreate/' + professor.id;
            history.push(page);
        }
    }

    useEffect(()=>{
        loadEntries();
    }, [searchText]);
    useEffect(()=>{
        console.log(" dbManager changed");
        loadEntries();
    },[dbManager]);


    useEffect(()=>{
        console.log("Will init!");
        //    loadEntries();
        const unlisten = history.listen((location, action) => {
            if (location && location.pathname === "/page/Professors") {
                loadEntries()
            }
        });
        return () => {
            // Will unmount
            console.log("Will destroy!");
            unlisten();
        }
    },[]);


    const itemList = students.map((professor) => (
        <IonItem key={professor.id}>
            <IonAvatar slot="start">
                <img src="/assets/avatar.svg" />
            </IonAvatar>
            <IonLabel>
                <h3>{professor.name}</h3>
                <p>{professor.lastname}</p>
                <p>{"Phone: "+ professor.phone}</p>
            </IonLabel>
            <IonButton
                expand="block"
                onClick={() =>
                    present({
                        buttons: [{ text: 'Delete' , handler: deleteAction(professor)}, { text: 'Edit' , handler: editAction(professor)}],
                        header: 'Actions: ' + professor.name
                    })
                }
            >
                Actions
            </IonButton>
        </IonItem>
    ))

    const handleSearchTextChange = (event: any) => {
        const {value} = event.target;
        setSearchText(value);
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
                        <form className="ion-padding" >
                            <IonItem>
                                <IonLabel position="floating">Search</IonLabel>
                                <IonInput type="text" value={searchText} name="name" onIonChange={handleSearchTextChange}/>
                            </IonItem>

                            {itemList}
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

export {
    ProfessorsPage
};
