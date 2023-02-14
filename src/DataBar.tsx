import React, { useEffect  } from 'react';
import bostonShotsFired from './boston_shots_fired.json';

type DataBarProps = {
    filteredNeighborhood: Array<any>
}

// console.log('print bostonShotsFired')
// console.log(bostonShotsFired)

export function DataBar ({filteredNeighborhood}:DataBarProps) {

    
    
    let displayBarValue
    let filled = 0
    let shotsFiredText:any = 0
    let maxValue = 0
    if (filteredNeighborhood.length > 0) {
        // console.log('printing filteredNeighborhood from DataBar')
        // console.log(filteredNeighborhood[0].properties.Acres)
        // displayAcres = filteredNeighborhood[0].properties.Acres
        
        
        // console.log('print maxValue')
        // console.log(maxValue)

        shotsFiredText = bostonShotsFired.filter(singleNeighborhood => {
            //console.log(singleNeighborhood.properties.Name)
            //console.log(singleNeighborhood.geometry.coordinates[0][0])

            // console.log('compare')
            // console.log(singleNeighborhood.properties.Name)
            // console.log(neighborhood)
            if (singleNeighborhood.neighborhood == filteredNeighborhood[0].properties.Name) {
              //console.log(neighborhood.geometry.coordinates)
              //console.log(singleNeighborhood.geometry.coordinates[0][0])
              return singleNeighborhood
            }
          }).map(singleNeighborhood => singleNeighborhood.value)[0]

        if (shotsFiredText?.length < 1) { 
            shotsFiredText='no data found' 
        } else {
            maxValue = Math.max(...bostonShotsFired.map(singleNeighborhood => singleNeighborhood.value))
            filled = shotsFiredText / maxValue*400
        }

        console.log('print shotsFiredText')
        console.log(shotsFiredText)
      }

      

    return (    
    <>
    <div className='shotsFiredMenu' style={filteredNeighborhood.length == 0 ? {display:'None'} : {}}>
        <div style={{
            height: "25px",
            width: `${filled}px`,
            backgroundColor:"rgb(235 13 13)",
            transition:"width .5s"
        }}></div>
       <div style={{
            padding: "5px",
            color: "white",
            fontSize: "1.5rem",
            }}>Shots Fired: {shotsFiredText? shotsFiredText: 'no data found'}</div> 
    </div>
    </>
    )
}