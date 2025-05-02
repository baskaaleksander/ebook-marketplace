import { Test, TestingModule } from '@nestjs/testing';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { ReviewService } from './review.service';
import { FavouritesService } from './favourites.service';
import { ViewedListingsService } from './viewedListing.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { ReviewOrderDto } from './dtos/review-order.dto';
import { SearchQueryDto } from '../dtos/search-query.dto';
import { AnalyticsService } from './analytics.service';
import { Request } from 'express';


describe('ListingController', () => {
  let controller: ListingController;
  let listingService: ListingService;
  let reviewService: ReviewService;
  let favouritesService: FavouritesService;
  let viewedListingsService: ViewedListingsService;
  let analyticsService: AnalyticsService

  const mockListingService = {
    findListings: jest.fn(),
    getRecentListings: jest.fn(),
    findUserListings: jest.fn(),
    findListingById: jest.fn(),
    createListing: jest.fn(),
    updateListing: jest.fn(),
    deleteListing: jest.fn(),
  };

  const mockReviewService = {
    getReview: jest.fn(),
    getReviews: jest.fn(),
    createReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
  };

  const mockFavouritesService = {
    getFavorites: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  };

  const mockViewedListingsService = {
    getViewedProducts: jest.fn(),
    trackListingView: jest.fn(),
  };

  const mockAnalyticsService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingController],
      providers: [
        { provide: ListingService, useValue: mockListingService },
        { provide: ReviewService, useValue: mockReviewService },
        { provide: FavouritesService, useValue: mockFavouritesService },
        { provide: ViewedListingsService, useValue: mockViewedListingsService },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    controller = module.get<ListingController>(ListingController);
    listingService = module.get<ListingService>(ListingService);
    reviewService = module.get<ReviewService>(ReviewService);
    favouritesService = module.get<FavouritesService>(FavouritesService);
    viewedListingsService = module.get<ViewedListingsService>(ViewedListingsService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllListings', () => {
    it('should return all listings', async () => {
      const mockListings = [{ id: '1', title: 'Test Listing' }];
      const filterQuery : SearchQueryDto = {}
      mockListingService.findListings.mockResolvedValue(mockListings);

      const result = await controller.findListings(filterQuery);
      
      expect(result).toEqual(mockListings);
      expect(listingService.findListings).toHaveBeenCalledTimes(1);
    });
  });


  describe('getFavorites', () => {
    it('should return user favorites', async () => {
      const mockFavorites = [{ id: '1', title: 'Favorite Listing' }];
      mockFavouritesService.getFavorites.mockResolvedValue(mockFavorites);

      const result = await controller.getFavorites('user123');
      
      expect(result).toEqual(mockFavorites);
      expect(favouritesService.getFavorites).toHaveBeenCalledWith('user123');
    });
  });

  describe('addFavorite', () => {
    it('should add a listing to favorites', async () => {
      const mockResponse = { success: true };
      mockFavouritesService.addFavorite.mockResolvedValue(mockResponse);

      const result = await controller.addFavorite('listing123', 'user123');
      
      expect(result).toEqual(mockResponse);
      expect(favouritesService.addFavorite).toHaveBeenCalledWith('user123', 'listing123');
    });
  });

  describe('removeFavorite', () => {
    it('should remove a listing from favorites', async () => {
      const mockResponse = { success: true };
      mockFavouritesService.removeFavorite.mockResolvedValue(mockResponse);

      const result = await controller.removeFavorite('listing123', 'user123');
      
      expect(result).toEqual(mockResponse);
      expect(favouritesService.removeFavorite).toHaveBeenCalledWith('user123', 'listing123');
    });
  });

  describe('getViewedProducts', () => {
    it('should return viewed products', async () => {
      const mockViewedProducts = [{ id: '1', title: 'Viewed Listing' }];
      mockViewedListingsService.getViewedProducts.mockResolvedValue(mockViewedProducts);

      const result = await controller.getViewedProducts('user123');
      
      expect(result).toEqual(mockViewedProducts);
      expect(viewedListingsService.getViewedProducts).toHaveBeenCalledWith('user123');
    });
  });

  describe('findListingById', () => {
    it('should return a listing by id', async () => {
      const mockListing = { id: '1', title: 'Test Listing' };
      mockListingService.findListingById.mockResolvedValue(mockListing);

      const result = await controller.findListingById('1');
      
      expect(result).toEqual(mockListing);
      expect(listingService.findListingById).toHaveBeenCalledWith('1', undefined);
    });
  });

  describe('getReviews', () => {
    it('should return reviews for a listing', async () => {
      const mockReviews = [{ id: '1', rating: 5, comment: 'Great!' }];
      mockReviewService.getReviews.mockResolvedValue(mockReviews);

      const result = await controller.getReviews('listing123');
      
      expect(result).toEqual(mockReviews);
      expect(reviewService.getReviews).toHaveBeenCalledWith('listing123');
    });
  });

  describe('createReview', () => {
    it('should create a review', async () => {
      const mockReview = { id: '1', rating: 5, comment: 'Excellent!' };
      const reviewData: ReviewOrderDto = { rating: 5, comment: 'Excellent!' };
      mockReviewService.createReview.mockResolvedValue(mockReview);

      const result = await controller.createReview('listing123', 'user123', reviewData);
      
      expect(result).toEqual(mockReview);
      expect(reviewService.createReview).toHaveBeenCalledWith('listing123', 'user123', reviewData);
    });
  });

  describe('trackListingView', () => {
    it('should track listing view', async () => {
      const mockResponse = { success: true };
      mockViewedListingsService.trackListingView.mockResolvedValue(mockResponse);

      const result = await controller.trackListingView('listing123', 'user123');
      
      expect(result).toEqual(mockResponse);
      expect(viewedListingsService.trackListingView).toHaveBeenCalledWith('user123', 'listing123');
    });

    it('should track listing view with undefined user', async () => {
      const mockResponse = { success: true };
      mockViewedListingsService.trackListingView.mockResolvedValue(mockResponse);
      
      
      const result = await controller.trackListingView('listing123', null);
      
      expect(result).toEqual(mockResponse);
      expect(viewedListingsService.trackListingView).toHaveBeenCalledWith(null, 'listing123');
    });
    
    it('should track listing view with user ID', async () => {
      const mockResponse = { success: true };
      mockViewedListingsService.trackListingView.mockResolvedValue(mockResponse);
      
      
      const result = await controller.trackListingView('listing123', 'user123');
      
      expect(result).toEqual(mockResponse);
      expect(viewedListingsService.trackListingView).toHaveBeenCalledWith('user123', 'listing123');
    });
  });

  describe('createListing', () => {
    it('should create a listing', async () => {
      const listingDto: CreateListingDto = { title: 'New Listing', price: 10, description: 'Test' } as CreateListingDto;
      const mockListing = { id: '1', ...listingDto };
      mockListingService.createListing.mockResolvedValue(mockListing);

      const result = await controller.createListing(listingDto, 'user123');
      
      expect(result).toEqual(mockListing);
      expect(listingService.createListing).toHaveBeenCalledWith(listingDto, 'user123');
    });
  });

  describe('updateListing', () => {
    it('should update a listing', async () => {
      const updateDto: UpdateListingDto = { title: 'Updated Listing' } as UpdateListingDto;
      const mockListing = { id: '1', title: 'Updated Listing' };
      mockListingService.updateListing.mockResolvedValue(mockListing);

      const result = await controller.updateListing('1', updateDto, 'user123');
      
      expect(result).toEqual(mockListing);
      expect(listingService.updateListing).toHaveBeenCalledWith('1', updateDto, 'user123');
    });
  });

  describe('deleteListing', () => {
    it('should delete a listing', async () => {
      const mockResponse = { success: true };
      mockListingService.deleteListing.mockResolvedValue(mockResponse);
      const updateDto = {} as UpdateListingDto;

      const result = await controller.deleteListing('1', 'user123');
      
      expect(result).toEqual(mockResponse);
      expect(listingService.deleteListing).toHaveBeenCalledWith('1', 'user123');
    });
  });
});