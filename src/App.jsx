import React, {useState, useEffect, useContext, useCallback} from 'react';
import {Grid2, Card, CardContent, CardActionArea, Box, Typography} from "@mui/material";
import {getAndSetJson, i18nContext, netContext, doI18n, debugContext} from 'pithekos-lib';

function App() {
    const [clients, setClients] = useState([]);
//    const [selectedCard, setSelectedCard] = useState(0);
    const [localRepos, setLocalRepos] = useState([]);


    useEffect(
        () => {
            getAndSetJson({
                url: "/list-clients",
                setter: setClients
            }).then()
        },
        []
    );

    useEffect(
        () => {
            getAndSetJson({
                url: "/git/list-local-repos",
                setter: setLocalRepos
            }).then();
        },
        []
    );

    const editableRepos = localRepos.filter((local) => local.startsWith('_local_/_local_'));

    const {i18nRef} = useContext(i18nContext);
    const {enabledRef} = useContext(netContext);
    const {debugRef} = useContext(debugContext);
    const [maxWindowHeight, setMaxWindowHeight] = useState(window.innerHeight - 64);

    const handleWindowResize = useCallback(() => {
        setMaxWindowHeight(window.innerHeight - 64);
    }, []);


    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [handleWindowResize]);

    const handleClick = () => {
        console.info('You clicked the Chip.');
        window.location.href = 'content';
      };

    return <Box sx={{maxHeight: maxWindowHeight}}>
                <Grid2
                    container
                    spacing={2}
                    justifyItems = "flex-end"
                    alignItems = "stretch"
                >
                    <Grid2 item size={12}>
                        <p><b>{doI18n("pages:core-dashboard:summary", i18nRef.current)}</b></p>
                    </Grid2>
                    { !(editableRepos.length > 0) && 
                        <Card 
                            sx={{ 
                                maxWidth: 345,
                                border: "1px #000 solid",
                                borderRadius: "5px",
                                backgroundColor: "#FFF",
                                color: 'text.primary',
                                '&:hover': {backgroundColor: '#F5F5F5'}
                            }}
                        >
                            <CardActionArea onClick={handleClick} >
                                <CardContent>
                                    <Typography>
                                        You have not yet created your first content. Would you like to start now?
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    }
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
                                    size={12}
                                >
                                    <Card sx={{height: "auto", width: "100%"}}>
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
    </Box>
}

export default App;
