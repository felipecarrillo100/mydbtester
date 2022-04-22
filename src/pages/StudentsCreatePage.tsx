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
import {SQLStudentService, Student} from "../services/tables/SQLStudentService";
import { useHistory } from "react-router-dom";
import { useParams } from 'react-router';

interface Props {
    dbManager: DataBaseManager | null;
}

const StudentsCreatePage: React.FC<Props> = (props:Props) => {
    const history = useHistory();
    const { id } = useParams<{ id: string; }>();

    const pageName = typeof id !== "undefined" ? "Edit Student" : "Create Student";
    const buttonTile = typeof id !== "undefined" ? "Update" : "Create";

    const [present, dismiss] = useIonToast();

    const [student, setStudent] = useState({
        name: "",
        lastname: "",
        phone: "",
    } as Student);

    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState("");

    const {dbManager} = props;

    const loadById = (idStr: string) => {
        const id = Number(idStr);
        if (student && typeof student.id!== "undefined" && student.id === id) return;
        const db = props.dbManager?.getDb();
        if (db) {
            const studentService = new SQLStudentService(db);
            studentService.get(id).then((loadedStudent) => {
                if (loadedStudent) {
                    console.log(loadedStudent);
                    setStudent(loadedStudent);
                }
            });
        }
    }

    useEffect(()=> {
        console.log("id:" + id);
        if (id) {
            loadById(id);
        } else {
            if (typeof student.id !== "undefined") setStudent({name:"", lastname: "", phone: ""});
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
        const s = student;
        // @ts-ignore
        s[name] = value;
        setStudent(student);
    }

    const create = () => {
        const db = dbManager?.getDb();
        if (db) {
            if (student.name === "" || student.lastname === "" || student.phone === "") {
                present({
                    buttons: [{ text: 'hide', handler: () => dismiss() }],
                    message: 'Field in all the fields',
                    duration: 1500
                })
            } else {
                const studentService = new SQLStudentService(db);

                if (typeof student.id!== "undefined") {
                    studentService.put(student.id, student).then((newStudent) => {
                        console.log(newStudent);
                        setStudent({name:"", lastname: "", phone: ""});
                        history.push('/page/Students');
                    });
                } else {
                    studentService.add(student).then((newStudent) => {
                        console.log(newStudent);
                        setStudent({name:"", lastname: "", phone: ""});
                        history.push('/page/Students');
                    });
                }

            }
        }
    }

    const cancel = () => {
        history.push('/page/Students');
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
                                    <IonInput type="text" value={student.name} name="name" onIonChange={handleChange}/>
                                </IonItem>

                                <IonItem>
                                    <IonLabel position="floating">Lastname</IonLabel>
                                    <IonInput type="text" value={student.lastname} name="lastname"
                                              onIonChange={handleChange}/>
                                </IonItem>

                                <IonItem>
                                    <IonLabel position="floating">Phone</IonLabel>
                                    <IonInput type="text" value={student.phone} name="phone"
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
        StudentsCreatePage
    }