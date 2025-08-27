import React, {useState, useEffect, useContext, useCallback} from 'react';
import {Grid2, Card, CardContent, CardActionArea, Box, Typography} from "@mui/material";
import {getAndSetJson, i18nContext, netContext, doI18n, debugContext, postEmptyJson, getJson} from 'pithekos-lib';
import {PlayArrow} from "@mui/icons-material";

function App() {
    const [clients, setClients] = useState([]);
    const [projectSummaries, setProjectSummaries] = useState({});

    const getProjectSummaries = async () => {
        const summariesResponse = await getJson(`/burrito/metadata/summaries`, debugRef.current);
        if (summariesResponse.ok) {
            setProjectSummaries(summariesResponse.json);
        }
    }

    useEffect(
        () => {
            getProjectSummaries().then();
        },
        []
    );

    useEffect(
        () => {
            getAndSetJson({
                url: "/list-clients",
                setter: setClients
            }).then()
        },
        []
    );

    const editableRepos = Object.entries(projectSummaries).filter((repo) => repo[0].startsWith("_local_/_local_"));
    const translationResources = Object.entries(projectSummaries).filter((repo) => repo[0].startsWith("git.door43.org"));

    const {i18nRef} = useContext(i18nContext);
    const {enabledRef} = useContext(netContext);
    const {debugRef} = useContext(debugContext);

    const cardStyle = {
        display: "flex",
        maxWidth: 345,
        border: "1px #000 solid",
        borderRadius: "5px",
        backgroundColor: "#FFF",
        color: 'text.primary',
        '&:hover': {backgroundColor: '#F5F5F5'}
    }

    return <Box sx={{mb: 2, position: 'fixed', top: '64px', bottom: 0, right: 0, overflow: 'scroll', width: '100%' }}>
                <Grid2
                    container
                    sx={{mx:2}}
                    spacing={2}
                    justifyItems = "flex-end"
                    alignItems = "stretch"
                >
                    <Grid2 item size={12}>
                        <b>{doI18n("pages:core-dashboard:summary", i18nRef.current)}</b>
                    </Grid2>
                    { (editableRepos.length > 0)
                        ?
                            <Grid2 item size={4}>
                                {editableRepos.map((repo) =>
                                    <Card sx={cardStyle}>
                                        <CardActionArea onClick={
                                            async () => { 
                                                const fullMetadataResponse = await getJson(`/burrito/metadata/raw/${repo[0]}`);
                                                if (fullMetadataResponse.ok) {
                                                    const bookCodes =
                                                        Object.entries(fullMetadataResponse.json.ingredients)
                                                            .map(
                                                                i =>
                                                                    Object.keys(i[1].scope || {})
                                                            )
                                                            .reduce(
                                                                (a, b) => [...a, ...b],
                                                                []
                                                            );
                                                    await postEmptyJson(`/navigation/bcv/${bookCodes[0]}/1/1`);
                                                    await postEmptyJson(`/app-state/current-project/${repo[0]}`);
                                                    window.location.href = '/clients/local-projects'
                                                } else {
                                                    console.log("Metadata fetch failed");
                                                    console.log(fullMetadataResponse);
                                                }
                                            }
                                        }>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <CardContent sx={{ flex: '1 0 auto' }}>
                                                    <Typography component="div" variant="h6">
                                                        {doI18n("pages:core-dashboard:edit", i18nRef.current)}
                                                        {" "}
                                                        {repo[1].name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", flexDirection: 'row' }}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                            <Typography
                                                                variant="subtitle1"
                                                                component="div"
                                                                sx={{ color: 'text.secondary' }}
                                                            >
                                                                {repo[1].flavor}
                                                            </Typography>
                                                            <Typography
                                                                variant="subtitle1"
                                                                component="div"
                                                                sx={{ color: 'text.secondary' }}
                                                            >
                                                                {repo[1].abbreviation}
                                                            </Typography>
                                                        </Box>
                                                        <PlayArrow size="large" sx={{ml: 1}}/>
                                                    </Box>
                                                </CardContent>
                                            </Box>
                                        </CardActionArea>
                                    </Card>
                                )}
                            </Grid2>
                        :
                            <Grid2 item size={4}>
                                <Card sx={cardStyle}>
                                    <CardActionArea onClick={() => { window.location.href = '/clients/content' }} >
                                        <CardContent>
                                            <Typography>
                                                {doI18n("pages:core-dashboard:maybe_create_first_content", i18nRef.current)}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid2>
                    }
                    { (!(translationResources.length > 0) && (enabledRef.current) ) &&
                        <Grid2 item size={4}>
                            <Card sx={cardStyle}>
                                <CardActionArea onClick={() => { window.location.href = '/clients/download' }} >
                                    <CardContent>
                                        <Typography>
                                            {doI18n("pages:core-dashboard:maybe_install_first_resources", i18nRef.current)}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid2>
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
                                                <Typography variant="h6">
                                                    {doI18n(`pages:${c.id}:title`, i18nRef.current)}
                                                </Typography>
                                                <Typography>
                                                    {doI18n(`pages:${c.id}:summary`, i18nRef.current)}
                                                </Typography>
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
