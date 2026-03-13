import {useEffect, useState} from 'react'
import './mobile-step-city-0.css'

function CitySelector(){
    const [selectedCity, setSelectedCity] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [currentLevel, setCurrentLevel] = useState('countries')
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [selectedDistrict, setSelectedDistrict] = useState(null)
    const [selectedRegion, setSelectedRegion] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [data, setData] = useState(null)


    useEffect(() => {
        fetch('/geo.json')
            .then(res => res.json())
            .then(data => setData(data))
    }, [])
    const handleSelectCountry = (country) => {
        setSelectedCountry(country)
        setSelectedDistrict(null)
        setSelectedRegion(null)
        setSelectedCity(null)
        setCurrentLevel('districts')
        setSearchQuery('')
    }
    const handleSelectDistrict = (district) => {
        setSelectedDistrict(district)
        setSelectedRegion(null)
        setSelectedCity(null)
        setCurrentLevel('regions')
        setSearchQuery('')
    }
    const handleSelectRegion = (region) => {
        setSelectedRegion(region)
        setSelectedCity(null)
        setCurrentLevel('cities')
        setSearchQuery('')
    }
    const handleSelectCity = (city) =>{
        console.log(city)
        setSelectedCity(city)
        setModalOpen(false)
    }
    const goBack = () => {
        if (currentLevel === 'districts') {
            setCurrentLevel('countries')
            setSelectedCountry(null)
        } else if (currentLevel === 'regions') {
            setCurrentLevel('districts')
            setSelectedDistrict(null)
        } else if (currentLevel === 'cities') {
            setCurrentLevel('regions')
            setSelectedRegion(null)
            setSearchQuery('')
        }
    }
    const renderCountries = () => {
        if (!data) return <div>Загрузка...</div>

        return data.map(country => (
            <button
                key={country.id}
                className="list-item"
                onClick={() => handleSelectCountry(country)}
            >
                {country.name}
            </button>
        ))
    }
    const renderDistricts = () => {
        if (!selectedCountry || !selectedCountry.children) return null

        return selectedCountry.children.map(district => (
            <button
                key={district.id}
                className="list-item"
                onClick={() => handleSelectDistrict(district)}
            >
                {district.name}
            </button>
        ))
    }
    const renderRegions = () => {
        if (!selectedDistrict) return null

        return selectedDistrict.children.map(region => (
            <button
                key={region.id}
                className="list-item"
                onClick={() => handleSelectRegion(region)}
            >
                {region.name}
            </button>
        ))
    }
    const renderCities = () => {
        if (!selectedRegion) return null

        let cities = selectedRegion.children

        if (searchQuery) {
            cities = cities.filter(city =>
                city.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        cities.sort((a, b) => a.name.localeCompare(b.name))

        return cities.map(city => (
            <button
                key={city.id}
                className="list-item"
                onClick={() => handleSelectCity(city)}
            >
                {city.name}
            </button>
        ))
    }

    return (
        <div>
            <div className="selectContainer">
            <button onClick={()=>setModalOpen(true)}
                    className='selectButton'>
                Выбрать город
            </button>
            <span className='selectText'>
  {selectedCity ? selectedCity.name : 'Город не выбран'}
</span>
            </div>
            {modalOpen && (
                <div className='modalOverlay'>
                <div className="modalContent">
                    <div className="modalHeader">
                        <h3> Выбор города </h3>
                        <button className='cross' onClick={()=>setModalOpen(false)}></button>
                    </div>
                        <input
                            type="text"
                            className='searchCity'
                            placeholder="Название города"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    <small className='smallDescription'>Сейчас: {selectedCity ? selectedCity.name : 'город не выбран'}</small>
                    {currentLevel !== 'countries' && (
                        <button className="backButton" onClick={goBack}>
                            <span className='arrow'></span>
                            Назад
                        </button>
                    )}
                    <div className='items-list'>
                        {currentLevel === 'countries' && renderCountries()}
                        {currentLevel === 'districts' && renderDistricts()}
                        {currentLevel === 'regions' && renderRegions()}
                        {currentLevel === 'cities' && renderCities()}
                    </div>

                </div>
                </div>
            )}

        </div>
    )

}
export default CitySelector