import React, {useState, useEffect, useContext} from 'react';
import {Box, Grid2, Card, CardContent, CardMedia, CardActionArea, Typography} from "@mui/material";
import {getAndSetJson, i18nContext, netContext, doI18n, debugContext} from 'pithekos-lib';
import ArrowForward from '@mui/icons-material/ArrowForward';

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
                sx={{
                alignItems: "flex-start"
                }}
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
                                        item
                                        size={{ xs: 12, sm: 6, lg: 4 }}
                                    >
                                        <Card>
                                            <CardActionArea
                                                onClick={()=> {
                                                    if (enabledRef.current || !c.requires.net) {
                                                        window.location.href = c.url
                                                    }
                                                }}
                                                sx={{
                                                    border: "1px black solid",
                                                    borderRadius: "5px",
                                                    backgroundColor: (enabledRef.current || !c.requires.net) ? "#FFF" : "#CCC",
                                                    height: '100%',
                                                    width: '100%',
                                                    '&:hover': (enabledRef.current || !c.requires.net) && { backgroundColor: '#7e6282' }
                                                }}
                                            >
                                                <CardContent >
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
