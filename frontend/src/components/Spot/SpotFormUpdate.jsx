import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSpotDetails } from "../../store/spot";
import { updateExistingSpot } from "../../store/spot";
// import { addNewSpotImage } from "../../store/spotimagecrud";
// import { deleteExistingSpotImage } from "../../store/spotimagecrud";

const SpotFormUpdate = () => {

    const { spotId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const spotDetails = useSelector(state => state.spot.spotDetails[spotId]);
    
    useEffect (() => {
        dispatch(getSpotDetails(spotId))
    }, [dispatch, spotId]);

    
    const [country, setCountry] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [description, setDescription] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [previewImageUrl, setPreviewImageUrl] = useState("");
    const [imageOneUrl, setImageOneUrl] = useState("");
    const [imageTwoUrl, setImageTwoUrl] = useState("");
    const [imageThreeUrl, setImageThreeUrl] = useState("");
    const [imageFourUrl, setImageFourUrl] = useState("");
    const [errors, setErrors] = useState({});
    
    
    useEffect(() => {
        if (spotDetails) {
    
            setCountry(spotDetails.country);
            setStreetAddress(spotDetails.address);
            setCity(spotDetails.city);
            setState(spotDetails.state);
            setLatitude(spotDetails.lat);
            setLongitude(spotDetails.lng);
            setDescription(spotDetails.description);
            setName(spotDetails.name);
            setPrice(spotDetails.price);
            
            if (spotDetails.SpotImages.length === 1 ){
                setPreviewImageUrl(spotDetails.SpotImages[0].url);
            } else if (spotDetails.SpotImages.length === 2){
                setPreviewImageUrl(spotDetails.SpotImages[0].url)
                setImageOneUrl(spotDetails.SpotImages[1].url);
            } else if (spotDetails.SpotImages.length === 3){
                setPreviewImageUrl(spotDetails.SpotImages[0].url);
                setImageOneUrl(spotDetails.SpotImages[1].url);
                setImageTwoUrl(spotDetails.SpotImages[2].url);
            } else if (spotDetails.SpotImages.length === 4){
                setPreviewImageUrl(spotDetails.SpotImages[0].url)
                setImageOneUrl(spotDetails.SpotImages[1].url);
                setImageTwoUrl(spotDetails.SpotImages[2].url);
                setImageThreeUrl(spotDetails.SpotImages[3].url);
            } else if (spotDetails.SpotImages.length === 5){
                setPreviewImageUrl(spotDetails.SpotImages[0].url);
                setImageOneUrl(spotDetails.SpotImages[1].url);
                setImageTwoUrl(spotDetails.SpotImages[2].url);
                setImageThreeUrl(spotDetails.SpotImages[3].url);
                setImageFourUrl(spotDetails.SpotImages[4].url);
            } else {
                setPreviewImageUrl("");
                setImageOneUrl("");
                setImageTwoUrl("");
                setImageThreeUrl("");
                setImageFourUrl("");
            }

        }
    },[spotDetails]);


    useEffect(() => {
        const newErrors = {};
    
        if (country.length === 0) {
            newErrors.country = "Country is required";
        }
    
        if (streetAddress.length === 0) {
            newErrors.streetAddress = "Address is required";
        }
    
        if (city.length === 0){
            newErrors.city = "City is required";
        }
    
        if (state.length === 0){
            newErrors.state = "State is required";
        }
    
        if (latitude === "" || latitude === null){
            newErrors.latitude = "Latitude is required";
        }
    
        if (longitude === "" || longitude === null){
            newErrors.longitude = "Longitude is required";
        }
    
        if (description.length < 30){
            newErrors.description = "Description needs to be a minimum of 30 characters";
        }
    
        if (name.length === 0){
            newErrors.name = "Name is required";
        }
    
        if (price === "" || price === null){
            newErrors.price = "Price is required";
        }
      
        if (previewImageUrl.length === 0){
            newErrors.previewImageUrl = "Preview image is required";
        }
    
         else if (!/\.(jpeg|jpg|png)$/i.test(previewImageUrl)){
            newErrors.previewImageUrl = "Image URL must end in .png .jpg or .jpeg";
        }
    
        //Validate optional image urls
        const validImageUrl = (url) => !url || /\.(jpeg|jpg|png)$/i.test(url);
        
        if (!validImageUrl(imageOneUrl)){
            newErrors.imageOneUrl = "Image URL must end in .png .jpg or .jpeg";
        }
        
        if (!validImageUrl(imageTwoUrl)){
            newErrors.imageTwoUrl = "Image URL must end in .png .jpg or .jpeg";
        }
        
        if (!validImageUrl(imageThreeUrl)){
            newErrors.imageThreeUrl = "Image URL must end in .png .jpg or .jpeg";
        }
        
        if (!validImageUrl(imageFourUrl)){
            newErrors.imageFourUrl = "Image URL must end in .png .jpg or .jpeg";
        }
        setErrors(newErrors);
    }, [country, streetAddress, city, state, latitude, longitude, description, name, price, previewImageUrl, imageOneUrl, imageTwoUrl, imageThreeUrl, imageFourUrl]);
        

  

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (Object.keys(errors).length === 0){
            const spotFormValues = {
                country:country,
                address:streetAddress,
                city:city,
                state:state,
                lat:latitude,
                lng:longitude,
                description:description,
                name:name,
                price:price
            }

            
            const images = [
                {url: previewImageUrl, preview: true},
                {url: imageOneUrl, preview: false},
                {url: imageTwoUrl, preview: false},
                {url: imageThreeUrl, preview: false},
                {url: imageFourUrl, preview: false}
            ]
                
            //Filter out empty image urls before dispatching
            const validImages = images.filter(image => image.url.trim().length > 0);
                
            await dispatch(updateExistingSpot(spotId, spotFormValues, spotDetails.SpotImages,validImages));

            // //Use Promise.all to wait for all image dispatches
            // await Promise.all(spotDetails.SpotImages.map(image => dispatch(deleteExistingSpotImage(image.id))));
                
            // //Use Promise.all to wait for all image dispatches
            // await Promise.all(validImages.map(image => dispatch(addNewSpotImage(image, newSpot.id))));

            //Clear form inputs after successful submission
            setCountry("");
            setStreetAddress("");
            setCity("");
            setState("");
            setLatitude("");
            setLongitude("");
            setDescription("");
            setName("");
            setPrice("");
            setPreviewImageUrl("");
            setImageOneUrl("");
            setImageTwoUrl("");
            setImageThreeUrl("");
            setImageFourUrl("");

            //Navigate to the updated spot details page
            navigate(`/spots/${spotId}`);
            }

        }

    return (
        <form
            className="spot-form"
            onSubmit={handleSubmit}
        >
            <h1>Update Your Spot</h1>
            <h3>Where&apos;s your place located?</h3>
            <p>Guests will only get your exact address once they booked a reservation</p>
            {errors.country && <p>{errors.country}</p>}
            <label>
                Country
                <input 
                    type="text"
                    name="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                />
            </label>
            {errors.streetAddress && <p>{errors.streetAddress}</p>}
            <label>
                Street Address
                <input 
                    type="text"
                    name="street-address"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                />
            </label>
            {errors.city && <p>{errors.city}</p>}
            <label>
                City
                <input 
                    type="text"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
            </label>
            {errors.state && <p>{errors.state}</p>}
            <label>
                State
                <input 
                    type="text"
                    name="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                />
            </label>
            {errors.latitude && <p>{errors.latitude}</p>}
            <label>
                Latitude
                <input 
                    type="number"
                    name="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                />
            </label>
            {errors.longitude && <p>{errors.longitude}</p>}
            <label>
                Longitude
                <input 
                    type="number"
                    name="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                />
            </label>
            <h4>Descibe your place to Guests</h4>
            <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood</p>
            <label>
                {errors.description && <p>{errors.description}</p>}
                Description
                <input
                    type="text"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>
            <h4>Create a title for your spot</h4>
            <p>Catch guests&apos; attention with a spot title that highlights what makes your place special.</p>
            <label>
                {errors.name && <p>{errors.name}</p>}
                Name of your spot
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>
            <h4>Set a base price for your spot</h4>
            <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
            <label>
                {errors.price && <p>{errors.price}</p>}
                Price per night (USD)
                <input
                    type="number"
                    name="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </label>
            <h4>Liven up your spot with photos</h4>
            <p>Submit a link to atleast one photo to publish your spot.</p>
            {errors.previewImageUrl && <p>{errors.previewImageUrl}</p>}
            <label>
                Preview Image URL
                <input
                    type="text"
                    name="preview-image"
                    value={previewImageUrl}
                    onChange={(e) => setPreviewImageUrl(e.target.value)}
                />
            </label>
            {errors.imageOneUrl && <p>{errors.imageOneUrl}</p>}
            <label>
                Image URL
                <input
                    type="text"
                    name="image-one"
                    value={imageOneUrl}
                    onChange={(e) => setImageOneUrl(e.target.value)}
                />
            </label>
            {errors.imageTwoUrl && <p>{errors.imageTwoUrl}</p>}
            <label>
                Image URL
                <input
                    type="text"
                    name="image-two"
                    value={imageTwoUrl}
                    onChange={(e) => setImageTwoUrl(e.target.value)}
                />
            </label>
            {errors.imageThreeUrl && <p>{errors.imageThreeUrl}</p>}
            <label>
                Image URL
                <input
                    type="text"
                    name="image-three"
                    value={imageThreeUrl}
                    onChange={(e) => setImageThreeUrl(e.target.value)}
                />
            </label>
            {errors.imageFourUrl && <p>{errors.imageFourUrl}</p>}
            <label>
                Image URL
                <input
                    type="text"
                    name="image-four"
                    value={imageFourUrl}
                    onChange={(e) => setImageFourUrl(e.target.value)}
                />
            </label>
            <button
                type="submit"
                disabled={Object.keys(errors).length > 0}
            >
                Update Spot
            </button>
        </form>
    )
}

export default SpotFormUpdate;