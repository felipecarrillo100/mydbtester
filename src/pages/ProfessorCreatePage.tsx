import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader, IonInput,
    IonItem, IonLabel,
    IonMenuButton, IonModal,
    IonPage,
    IonTitle,
    IonToolbar, useIonToast
} from '@ionic/react';
import './Page.css';
import React, {useEffect, useState} from "react";
import {DataBaseManager} from "../services/DataBaseManager";
import { useHistory } from "react-router-dom";
import { useParams } from 'react-router';
import {Professor, SQLProfessorsService} from "../services/tables/SQLProfessorsService";

interface Props {
    dbManager: DataBaseManager | null;
}

const ProfessorCreatePage: React.FC<Props> = (props:Props) => {
    const history = useHistory();
    const { id } = useParams<{ id: string; }>();

    const pageName = typeof id !== "undefined" ? "Edit Professor" : "Create Professor";
    const buttonTile = typeof id !== "undefined" ? "Update" : "Create";

    const [present, dismiss] = useIonToast();

    const [professor, setProfessor] = useState({
        name: "",
        lastname: "",
        phone: "",
    } as Professor);

    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState("");

    const {dbManager} = props;

    const loadById = (idStr: string) => {
        const id = Number(idStr);
        if (professor && typeof professor.id!== "undefined" && professor.id === id) return;
        const db = props.dbManager?.getDb();
        if (db) {
            const dbService = new SQLProfessorsService(db);
            dbService.get(id).then((loadedEntry) => {
                if (loadedEntry) {
                    console.log(loadedEntry);
                    setProfessor(loadedEntry);
                }
            });
        }
    }

    useEffect(()=> {
        console.log("id:" + id);
        if (id) {
            loadById(id);
        } else {
            if (typeof professor.id !== "undefined") setProfessor({name:"", lastname: "", phone: ""});
        }
    });

    useEffect(()=>{
        console.log("Will init!");
        return () => {
            // Will unmount
            console.log("Will destroy!");
        }
    },[]);

    useEffect(() => {
        if (dbManager != null) {
            console.log("Create user Database is ready!");
        }
    }, [dbManager]);

    const handleChange = (event: any) => {
        const {value, name} = event.target;
        const s = professor;
        // @ts-ignore
        s[name] = value;
        setProfessor(professor);
    }

    const create = () => {
        const db = dbManager?.getDb();
        if (db) {
            if (professor.name === "" || professor.lastname === "" || professor.phone === "") {
                present({
                    buttons: [{ text: 'hide', handler: () => dismiss() }],
                    message: 'Field in all the fields',
                    duration: 1500
                })
            } else {
                const dbService = new SQLProfessorsService(db);

                if (typeof professor.id!== "undefined") {
                    dbService.put(professor.id, professor).then((newProfessor) => {
                        console.log(newProfessor);
                        setProfessor({name:"", lastname: "", phone: ""});
                        history.push('/page/Professors');
                    });
                } else {
                    dbService.add(professor).then((newStudent) => {
                        console.log(newStudent);
                        setProfessor({name:"", lastname: "", phone: ""});
                        history.push('/page/Professors');
                    });
                }

            }
        }
    }

    const cancel = () => {
        history.push('/page/Professors');
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton/>
                    </IonButtons>
                    <IonTitle>{pageName}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">{pageName}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {
                    dbManager !== null ? (
                        <form className="ion-padding">
                            <IonItem>
                                <IonLabel position="floating">Name</IonLabel>
                                <IonInput type="text" value={professor.name} name="name" onIonChange={handleChange}/>
                            </IonItem>

                            <IonItem>
                                <IonLabel position="floating">Lastname</IonLabel>
                                <IonInput type="text" value={professor.lastname} name="lastname"
                                          onIonChange={handleChange}/>
                            </IonItem>

                            <IonItem>
                                <IonLabel position="floating">Phone</IonLabel>
                                <IonInput type="text" value={professor.phone} name="phone"
                                          onIonChange={handleChange}/>
                            </IonItem>
                            <IonButton className="ion-margin-top" expand="block" onClick={cancel}>Cancel</IonButton>
                            <IonButton className="ion-margin-top" expand="block" onClick={create}>{buttonTile}</IonButton>
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
                                <IonTitle size="large">{pageName}</IonTitle>
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
    ProfessorCreatePage
}