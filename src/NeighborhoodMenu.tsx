import React, { useEffect  } from 'react';
import './index.css'

type NeighborhoodMenuProps = {
    onClickFunction: () => void
    neighborhoodNames: string[]
    addSelectedNeighborhood: (neighborhood: string) => void
  }
  
export function NeighborhoodMenu({neighborhoodNames, addSelectedNeighborhood, onClickFunction}: NeighborhoodMenuProps) {
    // neighborhoodNames.map(name => {
    //     return <div>{name}</div>
    // })

    // useEffect(() => {
    //     setFunction([]);
    //     createLayers({});
    //   }, [])

    neighborhoodNames.sort();


    return (
    <div className="cityMenu">
        <div style={{
            padding: "10px",
            color: "white",
            fontSize: "2rem",
            }}>Boston Neighborhoods Crime Map</div>

        {neighborhoodNames.map(name => {
        return <button onClick={() => addSelectedNeighborhood(name)} key={name}>{name}</button>
        })}

        <button onClick={() => onClickFunction()} style={{width:"400px"}}>reset</button>
        <div style={{
            padding: "10px",
            color: "white",
            fontSize: "1rem",
            }}>
        Crime incident reports are provided by <a style={{color:'rgb(158 255 228 / 87%)'}} target="_blank" href={'https://www.kaggle.com/datasets/AnalyzeBoston/crimes-in-boston'}>Boston Police Department (BPD)</a>
        </div>
    </div>
    )
}