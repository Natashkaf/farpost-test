import {useEffect, useState} from 'react'
import './mobile-step-city-0.css'
import Cookies from 'js-cookie'

function CitySelector(){
    const [selectedCity, setSelectedCity] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [currentLevel, setCurrentLevel] = useState('countries')
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [selectedDistrict, setSelectedDistrict] = useState(null)
    const [selectedRegion, setSelectedRegion] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [data, setData] = useState(null)
    const [filteredCities, setFilteredCities] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        const savedCityId = Cookies.get('savedCityId')
        if (savedCityId && data){
            const findCityById = (nodes, id) =>{
                for (const node of nodes){
                    if (node.id === parseInt(id)){
                        return node
                    }
                    if(node.children){
                        const found = findCityById(node.children, id)
                        if (found) return found
                    }
                }
                return null
            }
            for (const country of data){
                const found = findCityById([country], parseInt(savedCityId))
                if (found){
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setSelectedCity(found)
                    break
                }
            }

        }
    },[data])

    const isTerminalNode = (node) =>{
        return !node.children || node.children.length === 0
    }
    const handleSelectNode = (node) =>{
        Cookies.set('savedCityId', node.id, {expires:365})
        setSelectedCity(node)

        if(isTerminalNode(node)){
            setModalOpen(false)
            setSearchQuery('')
            setFilteredCities([])
        }
    }

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0 && selectedRegion?.children) {
            const filtered = selectedRegion.children.filter(city =>
                city.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredCities(filtered);
        } else {
            setFilteredCities([]);
        }
    };


    useEffect(() => {
        fetch('/geo.json')
            .then(res => res.json())
            .then(data => setData(data))
    }, [])
    const handleSelectCountry = (country) => {
        setSelectedCountry(country)
        setSelectedDistrict(null)
        setSelectedRegion(null)
        setCurrentLevel('districts')
        setSearchQuery('')
        if(isTerminalNode(country)){
            handleSelectNode(country)
        }
    }
    const handleSelectDistrict = (district) => {
        setSelectedDistrict(district)
        setSelectedRegion(null)
        setCurrentLevel('regions')
        setSearchQuery('')
        if(isTerminalNode(district)){
            handleSelectNode(district)
        }
    }
    const handleSelectRegion = (region) => {
        setSelectedRegion(region)
        setCurrentLevel('cities')
        setSearchQuery('')

        if(isTerminalNode(region)){
            handleSelectNode(region)
        }
    }
    const handleSelectCity = (city) =>{
        handleSelectNode(city)
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
        if (!selectedRegion?.children) return null

        let allCities = [...selectedRegion.children]

        if (searchQuery) {
            const filtered = allCities.filter(city =>
                city.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            return filtered.map(city => (
                <button
                    key={city.id}
                    className={`list-item ${city.count > 30000 ? 'bold-city' : ''} ${selectedCity?.id === city.id ? 'selected' : ''}`}
                    onClick={() => handleSelectCity(city)}
                >
                    <div className="list-item">
                        <span className="letter-indicator"></span>
                        {city.name}
                    </div>
                    <small className="small-region">{selectedRegion.name}</small>
                </button>
            ))
        }
        allCities.sort((a, b) => a.name.localeCompare(b.name))

        const topCities = [...allCities]
            .sort((a, b) => (b.count || 0) - (a.count || 0))
            .slice(0, 3)

        const otherCities = allCities.filter(city => !topCities.includes(city))

        const groupedCities = {}
        otherCities.forEach(city => {
            const firstLetter = city.name[0].toUpperCase()
            if (!groupedCities[firstLetter]) {
                groupedCities[firstLetter] = []
            }
            groupedCities[firstLetter].push(city)
        })

        const sortedLetters = Object.keys(groupedCities).sort()
        return (
            <>
                {topCities.length > 0 && (
                    <div>
                        {topCities.map(city => (
                            <button
                                key={city.id}
                                className={`list-item ${city.count > 30000 ? 'bold-city' : ''} ${selectedCity?.id === city.id ? 'selected' : ''}`}
                                onClick={() => handleSelectCity(city)}
                            >
                                <span className="letter-indicator"></span>
                                {city.name}
                            </button>
                        ))}
                    </div>
                )}

                {topCities.length > 0 && otherCities.length > 0 && (
                    <div className='separator'></div>
                )}

                {otherCities.length > 0 && (
                    <div>
                        {sortedLetters.map(letter => (
                            <div key={letter}>
                                {groupedCities[letter].map((city, index) => (
                                    <button
                                        key={city.id}
                                        className={`list-item ${city.count > 30000 ? 'bold-city' : ''} ${selectedCity?.id === city.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectCity(city)}
                                    >
                                         <span className="letter-indicator">
                                            {index === 0 ? letter : ''}
                                        </span>

                                        <span >{city.name}</span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </>
        )
    }

    return (
        <div>
            <div className="selectContainer">
                <button onClick={()=>setModalOpen(true)} className='selectButton'>
                    Выбрать город
                </button>
                <span className='selectText'>
                {selectedCity ? selectedCity.name : 'Город не выбран'}
            </span>
            </div>

            {modalOpen && (
                <div className='modalOverlay'
                     onClick={() => setModalOpen(false)}
                >
                    <div className="modalContent"
                         onClick={(e) => e.stopPropagation()}
                    >
                        {isMobile ? (
                            <>
                                <div className="modalHeader">
                                    <h3>Выбор города</h3>
                                    <button className='cross' onClick={() => setModalOpen(false)} />
                                </div>
                                    <div className="magnifying-glass"></div>
                                    <input
                                        type="text"
                                        className='searchCity'
                                        placeholder="Название города"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                    {searchQuery.length > 0 && (
                                        <button className='crossClearSearch' onClick={() => {
                                            setSearchQuery('');
                                            setFilteredCities([]);
                                        }} />
                                    )}
                            </>
                        ) : (
                            <div className="modalHeader">
                                <h3>Выбор города</h3>
                                <div className="search">
                                    <div className="magnifying-glass"></div>
                                    <input
                                        type="text"
                                        className='searchCity'
                                        placeholder="Название города"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                    {searchQuery.length > 0 && (
                                        <button className='crossClearSearch' onClick={() => {
                                            setSearchQuery('');
                                            setFilteredCities([]);
                                        }} />
                                    )}
                                </div>
                                <button className='cross' onClick={() => setModalOpen(false)} />
                            </div>
                        )}

                        <small className='smallDescription'>
                            Сейчас: {selectedCity ? selectedCity.name : 'город не выбран'}
                        </small>

                        {!searchQuery && currentLevel !== 'countries' && (
                            <button className="backButton" onClick={goBack}>
                                <span className='arrow'></span>
                                Назад
                            </button>
                        )}

                        {isMobile ? (
                            <div className='items-list'>
                                {currentLevel === 'countries' && renderCountries()}
                                {currentLevel === 'districts' && renderDistricts()}
                                {currentLevel === 'regions' && renderRegions()}
                                {currentLevel === 'cities' && (
                                    filteredCities.length > 0 ? filteredCities.map(city => (
                                        <button
                                            key={city.id}
                                            className={`list-item ${selectedCity?.id === city.id ? 'selected' : ''}`}
                                            onClick={() => handleSelectCity(city)}
                                        >
                                            <div className="about-city">
                                            {city.name}
                                            <small className="small-region">{selectedRegion?.name}</small>
                                            </div>
                                        </button>
                                    )) : renderCities()
                                )}
                            </div>
                        ) : (
                            <div className="grid-position">
                                <div className="column">
                                    <div className="column-items">
                                        {data?.find(c => c.name === 'Россия')?.children?.map(district => (
                                            <button
                                                key={district.id}
                                                className={`list-item ${selectedDistrict?.id === district.id ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedDistrict(district);
                                                    setSelectedRegion(null);
                                                    setSelectedCity(null);
                                                }}
                                            >
                                                {district.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {!selectedDistrict && !selectedRegion && (
                                    <div className="background-picture">
                                        <img src="src/assets/search-in-world.png" alt="" />
                                    </div>
                                )}

                                {selectedDistrict && (
                                    <div className="column">
                                        <div className="column-items">
                                            {selectedDistrict.children?.map(region => (
                                                <button
                                                    key={region.id}
                                                    className={`list-item ${selectedRegion?.id === region.id ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setSelectedRegion(region);
                                                        setSelectedCity(null);
                                                    }}
                                                >
                                                    {region.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedRegion && (
                                    <div className="column">
                                        <div className="column-items">
                                            {filteredCities.length > 0 ? filteredCities.map(city => (
                                                <button
                                                    key={city.id}
                                                    className={`list-item ${selectedCity?.id === city.id ? 'selected' : ''}`}
                                                    onClick={() => handleSelectCity(city)}
                                                >
                                                    <div className="about-city">
                                                        {city.name}
                                                        <small className="small-region">{selectedRegion?.name}</small>
                                                    </div>
                                                </button>
                                            )) : renderCities()
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )

}
export default CitySelector