import React, {useState, useEffect, useContext} from 'react';
import {Grid2, Card, CardContent, CardActionArea} from "@mui/material";
import {getAndSetJson, i18nContext, netContext, doI18n, debugContext} from 'pithekos-lib';

function App() {
    const [clients, setClients] = useState([]);
    const [selectedCard, setSelectedCard] = useState(0);

    useEffect(
        () => {
            getAndSetJson({
                url: "/list-clients",
                setter: setClients
            }).then()
        },
        []
    );
    const {i18nRef} = useContext(i18nContext);
    const {enabledRef} = useContext(netContext);
    const {debugRef} = useContext(debugContext);

    return <Grid2
        container
        spacing={2}
        justifyItems = "flex-end"
        alignItems = "stretch"
    >
        <Grid2 item size={12}>
            <p><b>{doI18n("pages:core-dashboard:summary", i18nRef.current)}</b></p>
        </Grid2>
        {
            clients
                .filter(c => !c.id.includes("dashboard"))
                .filter(c => !c.exclude_from_dashboard)
                .filter(c => (c.requires.debug && debugRef.current) || !c.requires.debug)
                .map(
                    c => <Grid2
                        justifyItems = "flex"
                        justifyDirection = "row"
                        alignItems = "stretch"
                        container
                        item
                        size={{xs: 12, sm: 6, lg: 4}}
                    >
                        <Card sx={{height: "auto"}}>
                            <CardActionArea
                                onClick={() => {
                                    if (enabledRef.current || !c.requires.net) {
                                        window.location.href = c.url
                                    }
                                }}
                                sx={{
                                    height: "auto",
                                    border: (enabledRef.current || !c.requires.net) ? "1px #000 solid" : "1px #9E9E9E solid",
                                    borderRadius: "5px",
                                    backgroundColor: "#FFF",
                                    color: (enabledRef.current || !c.requires.net) ? "#000" : "#9E9E9E",

                                    '&:hover': {backgroundColor: '#F5F5F5'}
                                }}
                                disabled={(enabledRef.current || !c.requires.net) ? false : true}
                            >
                                <CardContent sx={{height: "auto"}}>
                                    <h2>
                                        {doI18n(`pages:${c.id}:title`, i18nRef.current)}
                                    </h2>
                                    <p>{doI18n(`pages:${c.id}:summary`, i18nRef.current)}</p>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid2>
                )
        }
    </Grid2>
}

export default App;
